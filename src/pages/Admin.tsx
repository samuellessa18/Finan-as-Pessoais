import { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Trash2, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    listUsers, updateUserPlan, updateUserPremium, updateUserRole, deleteUser,
    type AdminUser,
} from '@/services/adminService';

// Roles SELECIONÁVEIS na UI — 'admin' é ocultado de propósito (gestão
// simplificada). O backend continua aceitando 'admin' (compat. futura).
const ROLE_OPTIONS: AdminUser['role'][] = ['user', 'super_admin'];

// Extrai a mensagem de erro do axios sem usar `any` (evita no-explicit-any).
const errMsg = (e: unknown, fallback: string): string =>
    (e as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback;

export default function Admin() {
    const { user } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const fetchUsers = useCallback(async (term?: string) => {
        try {
            setLoading(true);
            setUsers(await listUsers(term));
        } catch (e) {
            toast.error(errMsg(e, 'Erro ao carregar usuários.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Guarda de rota: apenas super_admin acessa o painel.
    if (user && user.role !== 'super_admin') return <Navigate to="/" replace />;

    const apply = async (id: string, fn: () => Promise<AdminUser>, ok: string) => {
        try {
            setBusyId(id);
            const updated = await fn();
            setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
            toast.success(ok);
        } catch (e) {
            toast.error(errMsg(e, 'Falha na operação.'));
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (u: AdminUser) => {
        if (!window.confirm(`Excluir definitivamente o usuário ${u.email}? Esta ação é irreversível.`)) return;
        try {
            setBusyId(u.id);
            await deleteUser(u.id);
            setUsers((prev) => prev.filter((x) => x.id !== u.id));
            toast.success('Usuário excluído.');
        } catch (e) {
            toast.error(errMsg(e, 'Falha ao excluir.'));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Administração</h1>
                    <p className="text-sm text-muted-foreground">Gerenciamento de usuários, planos e permissões</p>
                </div>
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); fetchUsers(search.trim() || undefined); }}
                className="flex items-center gap-2"
            >
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nome ou e-mail..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                </div>
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Buscar</button>
                <button type="button" onClick={() => { setSearch(''); fetchUsers(); }} className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground" title="Recarregar">
                    <RefreshCw className="h-4 w-4" />
                </button>
            </form>

            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/30">
                            <tr>
                                <th className="px-4 py-3 font-bold">Usuário</th>
                                <th className="px-4 py-3 font-bold">Plano</th>
                                <th className="px-4 py-3 font-bold">Premium</th>
                                <th className="px-4 py-3 font-bold">Role</th>
                                <th className="px-4 py-3 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
                            ) : users.map((u) => {
                                const isSelf = u.id === user?.id;
                                const busy = busyId === u.id;
                                return (
                                    <tr key={u.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-foreground">{u.name}{isSelf && <span className="ml-2 text-[10px] text-primary">(você)</span>}</p>
                                            <p className="text-xs text-muted-foreground">{u.email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={u.plan} disabled={busy}
                                                onChange={(e) => apply(u.id, () => updateUserPlan(u.id, e.target.value as 'free' | 'pro'), 'Plano atualizado.')}
                                                className="px-2 py-1.5 rounded-lg border border-border/50 bg-background text-xs"
                                            >
                                                <option value="free">free</option>
                                                <option value="pro">pro</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                disabled={busy}
                                                onClick={() => apply(u.id, () => updateUserPremium(u.id, !u.isPremium), 'Premium atualizado.')}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.isPremium ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}
                                            >
                                                {u.isPremium ? 'Premium ✓' : 'Free'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={u.role} disabled={busy || isSelf}
                                                title={isSelf ? 'Você não pode alterar seu próprio role' : ''}
                                                onChange={(e) => apply(u.id, () => updateUserRole(u.id, e.target.value as AdminUser['role']), 'Role atualizado.')}
                                                className="px-2 py-1.5 rounded-lg border border-border/50 bg-background text-xs disabled:opacity-50"
                                            >
                                                {/* Fallback desabilitado: mostra o valor atual (ex.: 'admin') sem oferecê-lo como escolha */}
                                                {!ROLE_OPTIONS.includes(u.role) && (
                                                    <option value={u.role} disabled>{u.role}</option>
                                                )}
                                                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                disabled={busy || isSelf}
                                                onClick={() => handleDelete(u)}
                                                title={isSelf ? 'Você não pode excluir a própria conta' : 'Excluir usuário'}
                                                className="p-2 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
