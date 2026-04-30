"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HistoryRecord, getHistory, deleteHistory, clearHistory } from "@/lib/history";

export function HistoryClient() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const router = useRouter();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleDelete(id: string) {
    if (confirm("确定要删除这条记录吗？")) {
      deleteHistory(id);
      setHistory(getHistory());
    }
  }

  function handleClear() {
    if (confirm("确定要清空所有记录吗？")) {
      clearHistory();
      setHistory([]);
    }
  }

  function handleReuse(record: HistoryRecord) {
    if (record.type === "oral") {
      router.push(`/oral?reuseId=${record.id}`);
    } else if (record.type === "pets") {
      router.push(`/pets?reuseId=${record.id}`);
    } else if (record.type === "custom") {
      router.push(`/custom?reuseId=${record.id}`);
    }
  }

  function getTypeName(type: string) {
    if (type === "oral") return "口播视频";
    if (type === "pets") return "萌宠视频";
    if (type === "custom") return "自定义视频";
    return "未知类型";
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft backdrop-blur md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              本地生成记录
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-300 md:text-base max-w-2xl">
              这里保存了您过往发起生成的历史参数，可以一键复用之前输入的长文案、角色设定或分镜脚本。
              (记录保存在浏览器本地)
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="rounded-full border border-rose-500/40 bg-rose-500/10 px-5 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
            >
              清空所有记录
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {history.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-10 text-center text-slate-400">
            暂无生成记录。前往口播或萌宠页面发起一次生成后，即可在这里看到历史记录。
          </div>
        ) : (
          history.map((record) => (
            <div
              key={record.id}
              className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur transition hover:border-violet-500/40"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      record.type === "oral"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {record.type === "oral" ? "口播视频" : "萌宠视频"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(record.createdAt).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-lg font-medium text-white line-clamp-2">
                  {record.title}
                </h2>
                <div className="mt-3 text-sm text-slate-400 line-clamp-3">
                  {record.type === "oral" && (
                    <>
                      文案：{record.data.sourceText}
                    </>
                  )}
                  {record.type === "pets" && (
                    <>
                      全局设定：{record.data.globalCharacter}
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                <button
                  onClick={() => handleDelete(record.id)}
                  className="text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  删除
                </button>
                <button
                  onClick={() => handleReuse(record)}
                  className="rounded-full bg-violet-500/20 border border-violet-500/30 px-4 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500 hover:text-white"
                >
                  复用参数
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
