"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResearchTreeNode, ResearchTreeStatus } from "@/types/content";
import styles from "./ResearchTree.module.css";

type ResearchTreeProps = {
  title: string;
  description?: string;
  nodes: ResearchTreeNode[];
  className?: string;
};

const statusLabels: Record<ResearchTreeStatus, string> = {
  draft: "Draft",
  "under-review": "Under review",
  published: "Published",
};

const statusClasses: Record<ResearchTreeStatus, string> = {
  draft: "border-gold/50 bg-gold/10 text-foreground",
  "under-review": "border-secondary/45 bg-secondary/10 text-foreground",
  published: "border-accent/45 bg-accent/10 text-foreground",
};

export function ResearchTree({
  title,
  description,
  nodes,
  className,
}: ResearchTreeProps) {
  const pathname = usePathname();
  const treeId = useMemo(() => `${pathname}:${title}`, [pathname, title]);
  const [openNodeIds, setOpenNodeIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const historyState = window.history.state as {
      researchTreeOpenNodes?: Record<string, string[]>;
    } | null;
    const savedOpenNodeIds = historyState?.researchTreeOpenNodes?.[treeId];

    setOpenNodeIds(new Set(Array.isArray(savedOpenNodeIds) ? savedOpenNodeIds : []));
  }, [treeId]);

  const setNodeOpen = (nodeId: string, isOpen: boolean) => {
    setOpenNodeIds((currentOpenNodeIds) => {
      const nextOpenNodeIds = new Set(currentOpenNodeIds);

      if (isOpen) {
        nextOpenNodeIds.add(nodeId);
      } else {
        nextOpenNodeIds.delete(nodeId);
      }

      const historyState = window.history.state as {
        researchTreeOpenNodes?: Record<string, string[]>;
      } | null;

      window.history.replaceState(
        {
          ...historyState,
          researchTreeOpenNodes: {
            ...historyState?.researchTreeOpenNodes,
            [treeId]: [...nextOpenNodeIds],
          },
        },
        "",
      );

      return nextOpenNodeIds;
    });
  };

  return (
    <div className={cn("rounded-lg border border-border bg-card p-2 shadow-soft sm:p-2.5", className)}>
      <div className="flex items-center gap-2 rounded-md bg-muted/70 px-2 py-1.5">
        <FolderOpen aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-accent" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-snug">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <ol className="ml-2 mt-1.5 border-l border-border sm:ml-3">
        {nodes.map((node, index) => (
          <TreeNode
            key={node.id ?? `${node.title}-${index}`}
            node={node}
            nodeId={node.id ?? `node-${index}`}
            depth={0}
            isLast={index === nodes.length - 1}
            openNodeIds={openNodeIds}
            onNodeOpenChange={setNodeOpen}
          />
        ))}
      </ol>
    </div>
  );
}

type TreeNodeProps = {
  node: ResearchTreeNode;
  nodeId: string;
  depth: number;
  isLast: boolean;
  openNodeIds: Set<string>;
  onNodeOpenChange: (nodeId: string, isOpen: boolean) => void;
};

function TreeNode({
  node,
  nodeId,
  depth,
  isLast,
  openNodeIds,
  onNodeOpenChange,
}: TreeNodeProps) {
  const hasChildren = Boolean(node.children?.length);

  return (
    <li className={cn("relative pl-3", !isLast && "pb-0.5")}>
      {hasChildren ? (
        <details
          className={styles.details}
          open={openNodeIds.has(nodeId)}
          onToggle={(event) => onNodeOpenChange(nodeId, event.currentTarget.open)}
        >
          <summary
            title={node.description}
            className={cn(
              "flex cursor-pointer list-none items-start gap-1.5 rounded-md px-1 py-1 transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-1.5 [&::-webkit-details-marker]:hidden",
              styles.summary,
            )}
          >
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0 text-accent transition-transform",
                styles.chevron,
              )}
            />
            <FolderOpen aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">
              {node.title}
            </span>
            <NodeBadges node={node} />
          </summary>
          <div className="ml-3 border-l border-border pb-0.5 pl-2 sm:ml-4 sm:pl-3">
            <ol className="grid gap-0">
              {node.children?.map((child, index) => (
                <TreeNode
                  key={child.id ?? `${child.title}-${index}`}
                  node={child}
                  nodeId={`${nodeId}/${child.id ?? `node-${index}`}`}
                  depth={depth + 1}
                  isLast={index === (node.children?.length ?? 0) - 1}
                  openNodeIds={openNodeIds}
                  onNodeOpenChange={onNodeOpenChange}
                />
              ))}
            </ol>
          </div>
        </details>
      ) : (
        <LeafNode node={node} />
      )}
    </li>
  );
}

function LeafNode({ node }: { node: ResearchTreeNode }) {
  if (!node.href) {
    return (
      <div
        title={node.description}
        className="flex items-start gap-1.5 rounded-md px-1 py-1 sm:px-1.5"
      >
        <FileText aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">{node.title}</span>
        <NodeBadges node={node} />
      </div>
    );
  }

  return (
    <Link
      href={node.href}
      title={node.description}
      className="flex items-start gap-1.5 rounded-md px-1 py-1 text-foreground no-underline transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-1.5"
    >
      <FileText aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">{node.title}</span>
      <NodeBadges node={node} />
    </Link>
  );
}

function NodeBadges({ node }: { node: ResearchTreeNode }) {
  if (!node.tag && !node.status) {
    return null;
  }

  return (
    <span className="flex shrink-0 flex-wrap items-center gap-1">
      {node.tag ? <TreeTag>{node.tag}</TreeTag> : null}
      {node.status ? <StatusPill status={node.status} /> : null}
    </span>
  );
}

function TreeTag({ children }: { children: string }) {
  return (
    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground ring-1 ring-border">
      {children}
    </span>
  );
}

function StatusPill({ status }: { status: ResearchTreeStatus }) {
  return (
    <span
      className={cn(
        "rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase",
        statusClasses[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
