import { useState } from 'react';
import CockpitLayout from './components/layout/CockpitLayout';
import useMapOverview from './pages/MapOverview';
import useTrafficStatus from './pages/TrafficStatus';
import useTrafficSafety from './pages/TrafficSafety';
import useFourColorWarning from './pages/FourColorWarning';
import useTrafficFlow from './pages/TrafficFlow';
import useVehicleData from './pages/VehicleData';
import useSurveillanceAlert from './pages/SurveillanceAlert';
import './styles/global.css';

function ModuleMapOverview() {
  const d = useMapOverview();
  return <CockpitInner {...d} />;
}
function ModuleTrafficStatus() {
  const d = useTrafficStatus();
  return <CockpitInner {...d} />;
}
function ModuleTrafficSafety() {
  const d = useTrafficSafety();
  return <CockpitInner {...d} />;
}
function ModuleFourColorWarning() {
  const d = useFourColorWarning();
  return <CockpitInner {...d} />;
}
function ModuleTrafficFlow() {
  const d = useTrafficFlow();
  return <CockpitInner {...d} />;
}
function ModuleVehicleData() {
  const d = useVehicleData();
  return <CockpitInner {...d} />;
}
function ModuleSurveillanceAlert() {
  const d = useSurveillanceAlert();
  return <CockpitInner {...d} />;
}

function CockpitInner({ leftPanel, rightPanel, mapContent, bottomBar, videoModal }) {
  return (
    <>
      <div className="cockpit-left"><div className="panel-scroll">{leftPanel}</div></div>
      <div className="cockpit-center">
        <div className="map-container">{mapContent}</div>
        {bottomBar && <div className="cockpit-bottom-bar">{bottomBar}</div>}
      </div>
      <div className="cockpit-right"><div className="panel-scroll">{rightPanel}</div></div>
      {videoModal}
    </>
  );
}

const MODULE_MAP = {
  map: ModuleMapOverview,
  traffic: ModuleTrafficStatus,
  safety: ModuleTrafficSafety,
  warning: ModuleFourColorWarning,
  flow: ModuleTrafficFlow,
  vehicle: ModuleVehicleData,
  alert: ModuleSurveillanceAlert,
};

export default function App() {
  const [activeModule, setActiveModule] = useState('map');
  const ActiveModule = MODULE_MAP[activeModule];

  return (
    <CockpitLayout activeModule={activeModule} onModuleChange={setActiveModule}>
      <ActiveModule key={activeModule} />
    </CockpitLayout>
  );
}
