export const SummaryCards = (props: any) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-card rounded-xl border border-border">Saldo: {props.totalBalance}</div>
            <div className="p-6 bg-card rounded-xl border border-border text-green-500">Receitas: {props.totalIncome}</div>
            <div className="p-6 bg-card rounded-xl border border-border text-red-500">Despesas: {props.totalExpenses}</div>
        </div>
    );
};
