// React 19 hoists <title> and <meta> rendered anywhere in the tree into <head>.
export function PageMeta({
  title,
  description,
  ogDescription = description,
  twitterCard = "summary",
}: {
  title: string;
  description: string;
  ogDescription?: string;
  twitterCard?: string;
}) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content={twitterCard} />
    </>
  );
}
