import type { AppTab } from "../types";
import { cn } from "./ui";

const TABS: { id: AppTab; label: string }[] = [
  { id: "history", label: "Lịch sử chạy xe" },
  { id: "violations", label: "Vi phạm" },
];

type TabBarProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export default function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex gap-1 px-4" aria-label="Tab điều hướng">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative -mb-px px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
