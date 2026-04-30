import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./routes/Dashboard";
import { CaseFilePage } from "./routes/CaseFilePage";
import { DeadlinesPage } from "./routes/DeadlinesPage";
import { PanelPage } from "./routes/PanelPage";
import { ConvenePage } from "./routes/ConvenePage";
import { SettingsPage } from "./routes/SettingsPage";
import { FolderStub } from "./routes/FolderStub";
import { PleadingsPage } from "./routes/PleadingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/case-file" element={<CaseFilePage />} />
        <Route path="/deadlines" element={<DeadlinesPage />} />
        <Route path="/panel" element={<PanelPage />} />
        <Route path="/convene" element={<ConvenePage />} />
        <Route path="/pleadings" element={<PleadingsPage />} />
        <Route
          path="/discovery"
          element={
            <FolderStub
              title="Discovery"
              folder="03_Discovery"
              description="Requests for disclosure, RFAs, RFPs, interrogatories, leave motions under TRCP 500.9, motions to compel and quash."
            />
          }
        />
        <Route
          path="/evidence"
          element={
            <FolderStub
              title="Evidence"
              folder="04_Evidence"
              description="Photos, repair estimates, police report (excluded under Tex. Transp. Code § 550.065), dashcam, witness statements, EDR data."
            />
          }
        />
        <Route
          path="/settlement"
          element={
            <FolderStub
              title="Settlement"
              folder="06_Settlement"
              description="TRCP 11 agreements, demands, offers, full release language, voluntary mediation under TRCP 500.7."
            />
          }
        />
        <Route
          path="/trial"
          element={
            <FolderStub
              title="Trial"
              folder="07_Trial"
              description="Exhibit list, witness list, cross outlines, voir dire, jury charge for J.P. Court six member jury under TRCP 504.1."
            />
          }
        />
        <Route
          path="/appeal"
          element={
            <FolderStub
              title="Appeal"
              folder="08_Appeal"
              description="De novo appeal to County Court under TRCP 506. Perfection within 21 days of judgment, appeal bond, full retrial."
            />
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
