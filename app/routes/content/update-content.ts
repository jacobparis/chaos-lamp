import type { ActionFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import nodepath from "path"
import { refreshAllContent, setRequiresUpdate } from "~/models/content.server"
import { getMdxListItems } from "~/utils/mdx.server"
import { setContentSHA } from "~/models/content-state.server"
import { getRequiredEnvVar } from "~/utils/misc"

type Body = {
  refreshAll?: boolean
  paths?: Array<string>
  sha: string
}

export const action: ActionFunction = async ({ request }) => {
  if (request.headers.get("auth") !== getRequiredEnvVar("REFRESH_TOKEN")) {
    return json({ message: "Not Authorised" }, { status: 401 })
  }

  const body = (await request.json()) as Body

  if ("refreshAll" in body && body.refreshAll === true) {
    await refreshAllContent()
    void getMdxListItems({ contentDirectory: "blog" })
    void getMdxListItems({ contentDirectory: "language-samples" })

    console.log(`🌀 Refreshing all contents. SHA: ${body.sha}`)

    return json({ message: "refreshing all contents" })
  }

  if ("paths" in body && Array.isArray(body.paths)) {
    const refreshPaths: Array<string> = []
    for (const path of body.paths) {
      const [contentDirectory, dirOrFile] = path.split("/")
      if (!contentDirectory || !dirOrFile) {
        continue
      }
      const slug = nodepath.parse(dirOrFile).name
      await setRequiresUpdate({ slug, contentDirectory })

      refreshPaths.push(path)
    }
    if (refreshPaths.some((p) => p.startsWith("blog"))) {
      void getMdxListItems({ contentDirectory: "blog" })
    }
    if (refreshPaths.some((p) => p.startsWith("language-samples"))) {
      void getMdxListItems({ contentDirectory: "language-samples" })
    }
    if ("sha" in body) {
      void setContentSHA(body.sha)
    }

    console.log("💿 Updating content", {
      sha: body.sha,
      refreshPaths,
      message: "refreshing content paths",
    })

    return json({
      sha: body.sha,
      refreshPaths,
      message: "refreshing content paths",
    })
  }

  return json({ message: "no action" }, { status: 400 })
}
