import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectRootPage({ params }: Props) {
  const { id } = await params;
  const targetId = id === "demo-1" ? "prj-demo-1" : id;
  redirect(`/app/projects/${targetId}/overview`);
}
