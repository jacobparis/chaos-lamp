import type {
  HeadersFunction,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { useLoaderData } from "@remix-run/react"
import BlogList from "~/components/blog-list"
import { getMdxListItems } from "~/utils/mdx.server"
import { getSeo } from "~/utils/seo"

type LoaderData = { blogList: Awaited<ReturnType<typeof getMdxListItems>> }

const [seoMeta, seoLinks] = getSeo({
  title: "Blog",
  description: "Jacob's Blog",
  twitter: {
    title: "Blog",
    description: "Jacob's Blog",
  },
})

export const meta: MetaFunction = () => {
  return { ...seoMeta }
}

export const links: LinksFunction = () => {
  return [...seoLinks]
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    "cache-control":
      loaderHeaders.get("cache-control") ?? "private, max-age=60",
    Vary: "Cookie",
  }
}

export const loader: LoaderFunction = async () => {
  const blogList = await getMdxListItems({ contentDirectory: "blog" })

  return json<LoaderData>(
    { blogList },
    {
      headers: { "cache-control": "private, max-age=60", Vary: "Cookie" },
    },
  )
}

export default function Blog() {
  const { blogList } = useLoaderData<LoaderData>()

  return (
    <section className="mr-auto min-h-screen max-w-prose px-4 pt-24 sm:pl-12">
      <BlogList blogList={blogList} />
    </section>
  )
}
