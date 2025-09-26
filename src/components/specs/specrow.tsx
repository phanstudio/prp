interface SpecRowProps {
    label: string;
    value: string;
}

const SpecRow = ({ label, value }: SpecRowProps) => (
    <div className="flex justify-between items-center py-3 border-b border-automotive-spec-border last:border-b-0">
        <span className="text-m uppercase tracking-wider text-automotive-dark-foreground/70 font-header">
            {label}
        </span>
        <span className="text-sm font-body text-automotive-dark-foreground">
            {value}
        </span>
    </div>
);

export default SpecRow