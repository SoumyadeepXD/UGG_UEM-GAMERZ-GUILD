/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEF } from '@/data/uggContent';
import { merge, sha, UggContent } from '@/lib/ugg/util';

const MEDIA = /^(img|video|poster|logo)$/;
const STATUS = ['live', 'upcoming', 'registering', 'completed'];
const get = (o: any, p: (string | number)[]): any => p.reduce((a, k) => (a ? a[k] : undefined), o);

interface Ctx {
  set: (p: (string | number)[], val: any) => void;
  add: (p: (string | number)[]) => void;
  rm: (p: (string | number)[], i: number) => void;
  mv: (p: (string | number)[], i: number, dir: number) => void;
  up: (p: (string | number)[], f?: File | null) => void;
}

/** Recursive field renderer: strings, lists, and nested objects are all editable. */
function Node({ v, path, k, ctx }: { v: any; path: (string | number)[]; k: string; ctx: Ctx }) {
  if (Array.isArray(v)) {
    return (
      <fieldset>
        {v.map((x, i) => (
          <div key={i}>
            <div className="row">
              <b style={{ flex: 1, fontSize: 12 }}>#{i + 1}</b>
              <button type="button" className="sm" onClick={() => ctx.mv(path, i, -1)}>↑</button>
              <button type="button" className="sm" onClick={() => ctx.mv(path, i, 1)}>↓</button>
              <button type="button" className="sm" onClick={() => ctx.rm(path, i)}>Remove</button>
            </div>
            <Node v={x} path={[...path, i]} k="" ctx={ctx} />
          </div>
        ))}
        <button type="button" className="sm" onClick={() => ctx.add(path)}>+ Add item</button>
      </fieldset>
    );
  }
  if (v && typeof v === 'object') {
    const hideHash = path.length === 1 && path[0] === 'admin';
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        {Object.keys(v).filter((x) => !(hideHash && x === 'hash')).map((x) => (
          <div key={x}>
            <label>{x}</label>
            <Node v={v[x]} path={[...path, x]} k={x} ctx={ctx} />
          </div>
        ))}
      </div>
    );
  }
  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => ctx.set(path, e.target.value);
  if (k === 'status') return <select value={v ?? ''} onChange={set}>{STATUS.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
  if (k === 'accent' || k === 'bg') return <input type="color" value={v ?? '#000000'} onChange={set} />;
  if (k === 'newPassword') return <input type="password" value={v ?? ''} onChange={set} autoComplete="new-password" placeholder="Type a new password, then press Save" />;
  return (
    <div className="row">
      {String(v ?? '').length > 70 ? (
        <textarea rows={3} value={v ?? ''} onChange={set} />
      ) : (
        <input value={v ?? ''} onChange={set} />
      )}
      {MEDIA.test(k) && (
        <label className="sm" style={{ margin: 0, cursor: 'pointer', color: '#fff' }}>
          Upload
          <input type="file" hidden accept={k === 'video' ? 'video/*' : 'image/*'} onChange={(e) => ctx.up(path, e.target.files?.[0])} />
        </label>
      )}
    </div>
  );
}

interface AdminDrawerProps {
  content: UggContent;
  onChange: (d: UggContent) => void;
  onSave: (d: UggContent) => void;
  onClose: () => void;
  onLogout: () => void;
  toast: (m: string) => void;
}

export default function AdminDrawer({ content, onChange, onSave, onClose, onLogout, toast }: AdminDrawerProps) {
  const [draft, setDraft] = useState<UggContent>(() => structuredClone(content));
  const [tab, setTab] = useState<string>('hero');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const mut = (fn: (d: any) => void) => {
    const d = structuredClone(draft);
    fn(d);
    setDraft(d);
    onChange(d);
  };

  const ctx: Ctx = {
    set: (p, val) => mut((d) => {
      const parent = get(d, p.slice(0, -1));
      if (parent) parent[p[p.length - 1]] = val;
    }),
    add: (p) => mut((d) => {
      const a = get(d, p);
      if (!Array.isArray(a)) return;
      const s = a[0];
      a.push(typeof s === 'object' && s !== null ? JSON.parse(JSON.stringify(s, (_, v) => (typeof v === 'string' ? '' : v))) : '');
    }),
    rm: (p, i) => mut((d) => {
      const a = get(d, p);
      if (Array.isArray(a)) a.splice(i, 1);
    }),
    mv: (p, i, dir) => mut((d) => {
      const a = get(d, p);
      if (!Array.isArray(a)) return;
      const j = i + dir;
      if (a[j] !== undefined) [a[i], a[j]] = [a[j], a[i]];
    }),
    up: (p, f) => {
      if (!f) return;
      if (f.size > 2.5e6) return toast('File too large (max 2.5 MB). Host big videos elsewhere and paste the URL.');
      const r = new FileReader();
      r.onload = () => ctx.set(p, r.result);
      r.readAsDataURL(f);
    },
  };

  const save = async () => {
    const d = structuredClone(draft);
    if (d.admin.newPassword) {
      if (d.admin.newPassword.length < 6) return toast('Use at least 6 characters');
      d.admin.hash = await sha(d.admin.newPassword);
      toast('Password changed');
    }
    d.admin.newPassword = '';
    setDraft(d);
    onSave(d);
  };

  const reset = () => {
    if (!confirm('Reset everything to the original content?')) return;
    const d = structuredClone(DEF);
    d.admin.hash = draft.admin.hash;
    setDraft(d);
    onChange(d);
  };

  const exportJson = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }));
    a.download = 'ugg-content.json';
    a.click();
  };

  const importJson = (f?: File | null) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = merge(DEF, JSON.parse(r.result as string)) as UggContent;
        setDraft(d);
        onChange(d);
        toast('Imported – press Save to keep it');
      } catch {
        toast('Not a valid content file');
      }
    };
    r.readAsText(f);
  };

  return (
    <aside id="adm" className={open ? 'on' : ''} aria-label="Admin">
      <header>
        <b className="hd">Admin editor</b>
        <button type="button" className="btn fill sm" onClick={save}>Save</button>
        <button type="button" className="sm" onClick={reset}>Reset</button>
        <button type="button" className="sm" onClick={onClose}>Close</button>
        <button type="button" className="sm" onClick={onLogout}>Log out</button>
        <div style={{ width: '100%', display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          <select value={tab} onChange={(e) => setTab(e.target.value)} style={{ flex: 1 }}>
            {Object.keys(draft).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <button type="button" className="sm" onClick={exportJson}>Export</button>
          <label className="sm" style={{ margin: 0, cursor: 'pointer', color: '#fff' }}>
            Import
            <input type="file" hidden accept="application/json" onChange={(e) => importJson(e.target.files?.[0])} />
          </label>
          <Link href="/admin" className="sm" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            Database Portal ↗
          </Link>
        </div>
      </header>
      <div className="body">
        <Node v={(draft as any)[tab]} path={[tab]} k={tab} ctx={ctx} />
      </div>
    </aside>
  );
}
