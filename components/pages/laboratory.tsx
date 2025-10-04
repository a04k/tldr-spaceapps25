import DashboardPageLayout from "@/components/dashboard/layout"
import AtomIcon from "@/components/icons/atom"
import PaperSearch from "@/components/laboratory/paper-search"
import PaperGrid from "@/components/laboratory/paper-grid"

export default function LaboratoryPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Laboratory",
        description: "Search and explore research papers",
        icon: AtomIcon,
      }}
    >
      <div className="space-y-6">
        <PaperSearch />
        <PaperGrid />
      </div>
    </DashboardPageLayout>
  )
}
