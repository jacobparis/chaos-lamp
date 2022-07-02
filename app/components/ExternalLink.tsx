import { LinkHTMLAttributes } from "react"

export function ExternalLink(props: LinkHTMLAttributes<T>) {
  return <a target="_blank" rel="noopener" {...props} />
}
