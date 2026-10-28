export default function Status({ value }) {
  return <span className={`status status-${value}`}>{value}</span>;
}
