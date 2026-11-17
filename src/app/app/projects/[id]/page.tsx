import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectRootPage({ params }: Props) {
  const { id } = await params;
  if (id === "new") {
    redirect("/app/projects/new");
  }
  const targetId = id === "demo-1" || id === "demo" ? "prj-demo-1" : id;
  redirect(`/app/projects/${targetId}/overview`);
}
