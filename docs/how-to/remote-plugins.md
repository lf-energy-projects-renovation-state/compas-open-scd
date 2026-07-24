# Remote Plugins

The CoMPAS nginx container can download external plugins at **container build time** and
serve them directly, so the browser never needs to reach external sources.

## How it works

A multi-stage Docker build is used:

1. **`plugin-downloader` stage** – an Alpine container that runs
   [`distribution/scripts/download-plugins.sh`](../../distribution/scripts/download-plugins.sh).  
   It reads `distribution/remote-plugins.json`, downloads every listed plugin with `curl`, and
   optionally verifies the file's SHA-256 digest.
   - If a download fails, the build fails.
   - If a SHA-256 hash is provided and does not match, the build fails.
2. **Final nginx stage** – the downloaded plugins are copied from the builder stage
   into `/usr/share/nginx/html/external-plugins`, where nginx serves them under the
   `/external-plugins/` URL prefix.

Because the `COPY distribution/remote-plugins.json` instruction comes before the download step,
Docker's layer cache is only invalidated for the download stage when
`remote-plugins.json` actually changes. Updates to the application source alone
will not trigger a re-download of plugin files.

## Configuration file format

Plugins are defined in `distribution/remote-plugins.json` at the repository root:

```json
{
  "plugins": [
    {
      "name": "Human-readable name shown in build logs",
      "url": "https://example.com/path/to/plugin.js",
      "dest": "relative/dest/within/external-plugins/plugin.js",
      "sha256": "64-character hex SHA-256 digest (leave empty to skip verification)"
    }
  ]
}
```

| Field    | Required | Description                                                                                                                                                                                                    |
| -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | ✅       | Displayed in build output for easy identification.                                                                                                                                                             |
| `url`    | ✅       | Full URL of the plugin JavaScript file to download.                                                                                                                                                            |
| `dest`   | ✅       | Destination path **relative to** the `external-plugins/` directory. The path determines the URL at which nginx serves the plugin (e.g. `dest: "my-plugin/index.js"` → `/external-plugins/my-plugin/index.js`). |
| `sha256` | ⚠️       | Hex-encoded SHA-256 digest of the expected file content. Strongly recommended for all production deployments. Leave as `""` to skip integrity verification.                                                    |

## Managing plugins

Use the [`manage-plugins.js`](../../distribution/scripts/manage-plugins.js) helper
(exposed as npm scripts) to add, update, and verify plugins without editing the
two files by hand. All URLs must use `https`.

### Add a plugin

```sh
npm run plugins:add -- \
  --name "My Plugin" \
  --url  "https://example.com/path/to/plugin.js" \
  --sha256 <optional 64-char hex digest>
```

This appends the entry to `distribution/remote-plugins.json` and registers it in
`public/public/js/plugins.js` with `src: "/external-plugins/<dest>"`. If
`--dest` is omitted it defaults to the URL path (without the leading `/`);
optional editor metadata: `--icon`, `--kind`, `--active-by-default`,
`--require-doc`. To compute the hash beforehand:

```sh
curl -fsSL https://example.com/path/to/plugin.js | sha256sum
```

### Update a plugin

```sh
npm run plugins:update -- --name "My Plugin" [--url <new-url>] [--dest <new-dest>]
```

At least one of `--url` / `--dest` is required. The script re-downloads the
content and recomputes `sha256` so the stored hash cannot drift from the
served file, and rewrites the `src:` line in `plugins.js` when `dest` changes.

### Verify plugins

```sh
npm run plugins:verify              # all plugins
npm run plugins:verify -- --name "My Plugin"
```

Downloads every plugin and compares against its stored `sha256`. Entries with
an empty `sha256` are reported as _skipped_; mismatches and empty responses
exit non-zero.

### Rebuild the image

After any change, rebuild the Docker image so nginx serves the new file set:

```sh
docker build -f distribution/Dockerfile -t compas-open-scd .
```

## Security considerations

- **Always** provide a `sha256` hash for plugins used in production.  
  Without a hash, a compromised or changed upstream file would be served silently.
- Pin downloads to a specific version or commit-based URL rather than a moving
  branch name (e.g. prefer a tagged release URL over a `main` branch URL) so that
  rebuilding the image always produces the same result.
- To enforce that every plugin has a SHA-256 hash, pass `REQUIRE_SHA256=true` as a
  Docker build argument:

  ```sh
  docker build --build-arg REQUIRE_SHA256=true -f distribution/Dockerfile -t compas-open-scd .
  ```

  The build will fail immediately for any plugin entry that has an empty `sha256`
  field, making it impossible to accidentally ship un-verified plugins.
