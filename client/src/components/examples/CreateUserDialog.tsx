import { CreateUserDialog } from "../CreateUserDialog";

export default function CreateUserDialogExample() {
  return (
    <CreateUserDialog onSubmit={(data) => console.log("Submit:", data)} />
  );
}
