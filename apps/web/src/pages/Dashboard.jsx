import { useEffect, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader.jsx";
import { TierCounts } from "../components/dashboard/TierCounts.jsx";
import { FunnelChart } from "../components/dashboard/FunnelChart.jsx";
import { FollowUpList } from "../components/dashboard/FollowUpList.jsx";
import { getDashboard } from "../api/leads.js";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="card">
        <h3>Overview</h3>
        <p>
          {data.totalLeads} total leads · {(data.responseRate * 100).toFixed(0)}% response rate
          ({data.responseCount}/{data.sentCount} sent)
        </p>
      </div>
      <TierCounts tierCounts={data.tierCounts} />
      <FunnelChart funnel={data.funnel} />
      <FollowUpList followUps={data.followUps} />
    </div>
  );
}
