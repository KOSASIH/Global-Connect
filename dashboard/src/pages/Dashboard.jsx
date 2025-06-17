import React, { useEffect, useState } from "react";
import { getPartnerStatus, getAnalytics } from "../api";
import PartnerStatusCard from "../components/PartnerStatusCard";
import AnalyticsCharts from "../components/AnalyticsCharts";

export default function Dashboard() {
  const [partners, setPartners] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await getPartnerStatus();
      setPartners(p.partners || []);
      setAnalytics(await getAnalytics());
    })();
  }, []);

  return (
    <div>
      <h1>Global Connect Dashboard</h1>
      {partners.map((p) => (
        <PartnerStatusCard key={p.partnerId} partner={p} />
      ))}
      {analytics && <AnalyticsCharts analytics={analytics} />}
    </div>
  );
}
