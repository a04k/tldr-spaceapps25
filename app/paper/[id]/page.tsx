import DashboardPageLayout from "@/components/dashboard/layout"
import ProcessorIcon from "@/components/icons/proccesor"
import PaperViewer from "@/components/paper/paper-viewer"
import { notFound } from "next/navigation"
import { getPaperById } from "@/lib/contentlayer-papers"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PaperPage({ params }: PageProps) {
  const { id } = await params
  let paper;
  
  try {
    paper = await getPaperById(decodeURIComponent(id))
  } catch (error) {
    console.error(`Error loading paper ${id}:`, error)
    notFound()
  }

  if (!paper) {
    notFound()
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Paper Viewer",
        description: "Reading and analyzing research paper",
        icon: ProcessorIcon,
      }}
    >
      <PaperViewer paper={paper} />
    </DashboardPageLayout>
  )
}
