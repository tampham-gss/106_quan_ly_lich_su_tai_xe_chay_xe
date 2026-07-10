import { useId } from "react";

import type { ViolationRecord } from "../types";
import { formatViDate } from "../utils/dateUtils";
import ModalButton from "./modal/ModalButton";
import ModalFooter from "./modal/ModalFooter";
import ModalHeader from "./modal/ModalHeader";
import { cn } from "./ui";
import { MODAL_BODY_CLASS, MODAL_CONTAINER_CLASS } from "../styles/modalStyles";

type ViolationDeleteModalProps = {
  open: boolean;
  record: ViolationRecord | null;
  vehiclePlate?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ViolationDeleteModal({
  open,
  record,
  vehiclePlate,
  onClose,
  onConfirm,
}: ViolationDeleteModalProps) {
  const titleId = useId();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(MODAL_CONTAINER_CLASS, "max-w-md")}
        onClick={(event) => event.stopPropagation()}
      >
        <ModalHeader titleId={titleId} title="Xác nhận xóa" onClose={onClose} />

        <div className={MODAL_BODY_CLASS}>
          <p className="text-sm text-slate-600">
            {record ? (
              <>
                Bạn có chắc muốn xóa bản ghi vi phạm của tài xế{" "}
                <span className="font-semibold text-slate-900">{record.personnelName}</span>, xe{" "}
                <span className="font-semibold text-slate-900">{vehiclePlate ?? "—"}</span> ngày{" "}
                <span className="font-semibold tabular-nums text-slate-900">
                  {formatViDate(record.violationDate)}
                </span>
                , nội dung <span className="font-semibold text-slate-900">{record.content}</span>? Thao tác không thể
                hoàn tác.
              </>
            ) : (
              <>Bạn có chắc muốn xóa bản ghi vi phạm này? Thao tác không thể hoàn tác.</>
            )}
          </p>
        </div>

        <ModalFooter>
          <ModalButton variant="cancel" showIcon={false} onClick={onClose}>
            Hủy
          </ModalButton>
          <ModalButton variant="danger" showIcon={false} onClick={onConfirm}>
            Xóa
          </ModalButton>
        </ModalFooter>
      </div>
    </div>
  );
}
