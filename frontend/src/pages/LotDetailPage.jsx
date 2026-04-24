import React from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import ParkingLotDetail from "./ParkingLotDetail";
import { getLotBySlug } from "../data/lotConfigs";

function LotDetailPage() {
  const { lotSlug } = useParams();
  const navigate = useNavigate();
  const lot = getLotBySlug(lotSlug);

  if (!lot) return <Navigate to="/lots" replace />;

  return (
    <div className="container mx-auto px-4 py-12">
      <ParkingLotDetail
        selectedLot={lot.id}
        onBack={() => navigate("/lots")}
      />
    </div>
  );
}

export default LotDetailPage;
