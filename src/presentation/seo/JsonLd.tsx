interface JsonLdProps {
  readonly data: Record<string, unknown>;
}

/**
 * Renders one schema.org block. `</script` inside a string value is escaped to `<\/script`
 * — every value here comes from our own builders, never from a visitor, but a raw
 * `</script>` inside the JSON would still truncate this script element at parse time.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/<\/script/gi, "<\\/script");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
