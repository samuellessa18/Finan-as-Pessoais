export const TransactionForm = ({ onAdd }: any) => {
    return (
        <div className="p-6 bg-card rounded-xl border border-border">
            <h2 className="text-lg font-semibold mb-4">Nova Transação</h2>
            <button className="w-full py-2 bg-primary text-primary-foreground rounded-md">Adicionar</button>
        </div>
    );
};
