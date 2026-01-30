import LinkRedirectClient from "@/app/l/[linkId]/link-redirect-client";
import { SEED_LINK_IDS } from "@/mocks/seed";

export const dynamicParams = false;

export function generateStaticParams() {
  return SEED_LINK_IDS.map((linkId) => ({ linkId }));
}

export default function LinkRedirectPage({
  params
}: {
  params: { linkId: string };
}) {
  return <LinkRedirectClient linkId={params.linkId} />;
}
