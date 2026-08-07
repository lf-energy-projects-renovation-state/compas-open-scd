<!-- SPDX-FileCopyrightText: 2026 BearingPoint GmbH -->
<!-- -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Remote Plugins

The CoMPAS nginx container can download external plugins at **container build time** and
serve them directly, so the browser never needs to reach external sources.

## How it works

Plugin entries are read from [`remote-plugins.json`](./remote-plugins.json). 
At build time, the Docker build copies this file into a temporary Alpine container, 
which makes use of [`scripts/download-plugins.sh`](scripts/download-plugins.sh) 
to download every listed plugin from its source URL and places the files where nginx can serve them.

## Configuration file format

Plugins are defined in [`remote-plugins.json`](./remote-plugins.json) at the repository root:

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

Use the [`manage-plugins.js`](scripts/manage-plugins.js) helper
(exposed as npm scripts) to add, update, and verify plugins without editing the
two files by hand. All URLs must use `https`.

### Add a plugin

```sh
npm run plugins:add -- \
  --name "My Plugin" \
  --url  "https://example.com/path/to/plugin.js" \
  [--allow-insecure]
```

This appends the entry to `remote-plugins.json` and registers it in
`../public/public/js/plugins.js` with `src: "/external-plugins/<dest>"`.
The plugin is downloaded during the build, its SHA-256 hash is generated
automatically, and the hash is stored in `remote-plugins.json`. Add
`--allow-insecure` to leave `sha256` empty. If `--dest` is omitted it defaults
to the URL path (without the leading `/`); optional editor metadata:
`--icon`, `--kind`, `--active-by-default`, `--require-doc`. Existing plugins
with the same name, url, or dest are rejected.

CoMPAS references these plugins from [`public/public/js/plugins.js`](../public/public/js/plugins.js);
each entry points to `/external-plugins/<dest>`, and nginx serves the downloaded
files from that path in the container.

### Update a plugin

```sh
npm run plugins:update -- \
  --name "My Plugin" \
  --url <new-url> \
  [--dest <new-dest>] \
  [--allow-insecure]
```

The flags `--name` and `--url` are required. The script finds the existing
entry by name, re-downloads the content from the new URL, recomputes `sha256`
automatically unless `--allow-insecure` is used, and rewrites the `src:` line
in `plugins.js` when `dest` changes.

### Verify plugins

```sh
npm run plugins:verify              # all plugins
npm run plugins:verify -- --name "My Plugin"
npm run plugins:verify -- --allow-insecure
```

Downloads every plugin and compares against its stored `sha256`. Entries with
an empty `sha256` are reported as _skipped_; `--allow-insecure` skips the hash
comparison for every selected plugin. Mismatches and empty responses exit
non-zero.

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
