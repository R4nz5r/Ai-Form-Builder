import { useNavigate } from "react-router-dom";
import { FolderOpen, Plus } from "lucide-react";
import { PageHeader } from "./Insights.jsx";
import { Button } from "../components/ui/Button.jsx";
import { FormsBrowser } from "../components/forms/FormsBrowser.jsx";

export default function MyForms() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader
        icon={FolderOpen}
        title="My Forms"
        subtitle="Browse and manage everything you've created"
        right={
          <Button onClick={() => navigate("/builder/new")}>
            <Plus className="h-4 w-4" /> New form
          </Button>
        }
      />
      <div className="mt-6">
        <FormsBrowser title="" />
      </div>
    </div>
  );
}
