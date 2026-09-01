import { Modal } from "./Modal.jsx";
import { Button } from "./Button.jsx";

// a small confirm-before-you-act modal, for deletes and other one-way actions
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  danger = true,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : confirmLabel}
          </Button>
        </>
      }
    >
      {description ? <p className="text-sm text-muted">{description}</p> : null}
    </Modal>
  );
}

export default ConfirmDialog;
