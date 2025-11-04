import { CreateLicenseDialog } from "../CreateLicenseDialog";

export default function CreateLicenseDialogExample() {
  return (
    <CreateLicenseDialog onSubmit={(data) => console.log("Submit:", data)} />
  );
}
