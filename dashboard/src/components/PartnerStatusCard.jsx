import React from "react";
import { Card, Badge } from "react-bootstrap";

export default function PartnerStatusCard({ partner }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>
          {partner.name}{" "}
          <Badge bg={partner.status === "healthy" ? "success" : "danger"}>
            {partner.status}
          </Badge>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          Adoption Score: {partner.adoptionScore}%
        </Card.Subtitle>
        <Card.Text>
          Last Activity: {new Date(partner.lastCheck).toLocaleString()}
          <br />
          <strong>Recent Events:</strong>
          <ul>
            {(partner.recentActivity || []).map((evt, i) => (
              <li key={i}>
                {evt.type} @ {new Date(evt.timestamp).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
