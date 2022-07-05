import * as React from "react"
import type {
  HeadersFunction,
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { useLoaderData } from "@remix-run/react"
import { getMDXComponent } from "mdx-bundler/client"
import invariant from "tiny-invariant"
import { getMdxPage } from "~/utils/mdx.server"
import type { MdxComponent } from "~/types"

import { getSeoMeta } from "~/utils/seo"
import CodeBlock from "~/components/code-block"
import blogStyles from "app/styles/blog.css"

import { useUID } from "react-uid"
export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: blogStyles }]
}

export const meta: MetaFunction = ({ data }: { data: MdxComponent }) => {
  const { keywords = [] } = data.frontmatter.meta ?? {}
  const seoMeta = getSeoMeta({
    title: data.title,
    description: data.description,
    twitter: {
      description: data.description,
      title: data.title,
    },
  })

  return { ...seoMeta, keywords: keywords.join(", ") }
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    "cache-control":
      loaderHeaders.get("cache-control") ?? "private, max-age=60",
    Vary: "Cookie",
  }
}

export const loader: LoaderFunction = async ({ params }) => {
  const slug = params.slug
  invariant(typeof slug === "string", "Slug should be a string, and defined")

  const mdxPage = await getMdxPage({ contentDirectory: "blog", slug })

  if (!mdxPage) {
    throw json(null, { status: 404 })
  }

  return json<MdxComponent>(mdxPage, {
    headers: { "cache-control": "private, max-age: 60", Vary: "Cookie" },
  })
}

export default function Blog() {
  const data = useLoaderData<MdxComponent>()

  const Component = React.useMemo(() => getMDXComponent(data.code), [data])

  const url = `https://www.jacobparis.com/blog/${data.slug}`

  return (
    <article
      className="prose prose-slate mr-auto min-h-screen max-w-prose px-4  pt-24 dark:prose-invert sm:pl-12 lg:prose-lg"
      style={{ counterReset: "footnote-counter 0" }}
    >
      <h1 className="drop-shadow-sm"> {data.title} </h1>

      <Component
        components={{
          Tweet,
          Excerpt,
          SideNote,
          em: Highlight,
          pre: CodeBlock,
        }}
      />

      <footer className="text-gray-500">
        <p className="mb-5">
          If you enjoyed this post, please{" "}
          <a
            href={`https://twitter.com/intent/tweet?url=${url}`}
            rel="noopener"
            target="twitter"
          >
            let me know on Twitter!
          </a>
        </p>

        <p className="mb-5">
          If you've found any issues or typos, feel free to{" "}
          <a
            target="edit"
            rel="noopener"
            href={`https://github.com/JacobParis/chaos-lamp/edit/main/content/blog/${data.slug}.mdx`}
          >
            request changes here!
          </a>
        </p>
      </footer>
    </article>
  )
}

function Excerpt({ children, fade }) {
  return (
    <blockquote
      className={`my-4 rounded-lg border px-8 font-normal not-italic ${
        fade ? "text-gray-500" : "text-gray-700"
      }`}
    >
      {children}
    </blockquote>
  )
}

function Highlight({ children }: { children?: React.ReactNode }) {
  if (!children) {
    return null
  }

  return (
    <span className="-mx-1 bg-yellow-100 py-2 px-1 text-gray-700">
      {" "}
      {children}{" "}
    </span>
  )
}

function SideNote({ children }) {
  const id = useUID()

  return (
    // <aside> cannot be a child of <p>
    <span role="complementary">
      <label
        htmlFor={id}
        className={
          "relative -top-1 -mx-4 inline cursor-pointer px-4 align-baseline text-xs text-blue-700  after:content-['['_counter(footnote-counter)_']'] md:cursor-default md:text-gray-600"
        }
        style={{ counterIncrement: "footnote-counter" }}
      ></label>
      <input type="checkbox" id={id} tabIndex={0} className="peer hidden" />
      <span className="relative hidden transform overflow-visible border-l pl-4  align-baseline  text-sm opacity-90 before:relative before:-top-1 before:text-xs before:content-['['_counter(footnote-counter)_']']  peer-checked:left-0 peer-checked:float-left peer-checked:clear-both peer-checked:my-4 peer-checked:block peer-checked:h-auto md:!float-right md:!clear-right md:!my-0 md:mr-[-33%] md:block md:w-[33%] md:translate-x-4">
        {children}
      </span>
    </span>
  )
}

function Tweet({
  text,
  imageUrl = "",
  tweetUrl = "",
  className = "",
  ...props
}) {
  const paragraphs = Array.isArray(text) ? text : [text]
  return (
    <div
      {...props}
      className={`relative my-4 rounded-xl border bg-white p-4 hover:bg-gray-50 hover:shadow-sm ${className} not-prose`}
    >
      {tweetUrl ? (
        <a href={tweetUrl} className="absolute inset-0">
          <span className="sr-only">View tweet</span>
        </a>
      ) : null}

      <div className="mb-4 py-2">
        {/* Image on the left, text on the right  */}

        <div className="flex items-center">
          <img
            src="/images/jacob.png"
            alt="Tweet"
            className="w-12 rounded-full"
          />
          <div className="px-2">
            <div>
              <span className="font-semibold">Jacob Paris 🇨🇦</span>
            </div>
            <div>
              <span className="text-gray-700">@jacobmparis</span>
            </div>
          </div>
        </div>
      </div>

      {paragraphs.map((paragraph) => (
        <p className="mb-4 text-black">{paragraph}</p>
      ))}

      {imageUrl ? <img className="rounded-lg border" src={imageUrl} /> : null}
    </div>
  )
}
