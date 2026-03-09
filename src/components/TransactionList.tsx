export const TransactionList = ({ transactions, onDelete }: any) => {
    return (
        <div className="p-6 bg-card rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Transações</h2>
            <div className="space-y-2">
                {transactions.length === 0 ? (
                    <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
                ) : (
                    transactions.map((t: any) => (
                        <div key={t.id} className="flex justify-between items-center p-2 border-b border-border">
                            <span>{t.description}</span>
                            <button onClick={() => onDelete(t.id)} className="text-destructive text-sm">Excluir</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
