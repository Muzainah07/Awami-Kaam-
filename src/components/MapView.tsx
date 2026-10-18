import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { WorkerProfile, JobListing, SkillType } from '../types';
import { SKILL_WAGE_BENCHMARKS } from '../data/seed';
import { MapPin, Navigation, UserCheck, Briefcase, Filter } from 'lucide-react';

interface MapViewProps {
  workers: WorkerProfile[];
  jobs: JobListing[];
  activeJob?: JobListing | null;
  selectedWorker?: WorkerProfile | null;
  onSelectWorker?: (worker: WorkerProfile) => void;
  onSelectJob?: (job: JobListing) => void;
}

const SKILL_PIN_COLORS: Record<SkillType, string> = {
  painter: '#3B82F6',
  mason: '#EAB308',
  plumber: '#06B6D4',
  electrician: '#F97316',
  carpenter: '#8B5CF6',
  laborer: '#10B981',
  tile_worker: '#EC4899',
  welder: '#F43F5E',
  helper: '#10B981',
  cleaner: '#06B6D4',
  ac_technician: '#3B82F6',
};

export const MapView: React.FC<MapViewProps> = ({
  workers,
  jobs,
  activeJob,
  selectedWorker,
  onSelectWorker,
  onSelectJob,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filterSkill, setFilterSkill] = useState<string>('all');
  const [showWorkers, setShowWorkers] = useState<boolean>(true);
  const [showJobs, setShowJobs] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Karachi Center
    const map = L.map(mapContainerRef.current, {
      center: [24.8900, 67.0600],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Awami Kam',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    // 1. Worker Markers
    if (showWorkers) {
      workers.forEach(worker => {
        if (filterSkill !== 'all' && worker.primary_skill !== filterSkill) return;

        const color = SKILL_PIN_COLORS[worker.primary_skill] || '#10B981';
        const isSelected = selectedWorker?.id === worker.id;
        const benchmark = SKILL_WAGE_BENCHMARKS[worker.primary_skill];

        const customHtml = `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '44px' : '36px'};
            height: ${isSelected ? '44px' : '36px'};
            border-radius: 50%;
            background-color: ${color};
            color: white;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            border: 3px solid #ffffff;
            cursor: pointer;
            transition: all 0.2s ease;
            ${isSelected ? 'transform: scale(1.15); box-shadow: 0 0 0 6px rgba(11, 107, 58, 0.4);' : ''}
          ">
            <span style="font-size: ${isSelected ? '18px' : '15px'};">${benchmark?.icon || '👷'}</span>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-worker-pin',
          iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
          iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
        });

        const marker = L.marker([worker.latitude, worker.longitude], { icon });

        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 190px; text-align: left; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: #111827;">${worker.name}</strong>
              <span style="background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 6px; font-size: 11px; font-weight: bold;">
                ${benchmark?.labelEn || worker.primary_skill}
              </span>
            </div>
            <div style="font-size: 12px; color: #4B5563; margin-bottom: 2px;">
              📍 ${worker.location_area}, ${worker.city}
            </div>
            <div style="font-size: 12px; color: #111827; font-weight: 600; margin-bottom: 4px;">
              ₨ ${worker.expected_daily_rate_pkr.toLocaleString()} / day • ⭐ ${worker.reliability_score}
            </div>
            <div style="font-size: 11px; color: #6B7280; font-style: italic; margin-bottom: 6px;">
              "${worker.voice_intro_text || worker.transcript_original}"
            </div>
            <div style="font-size: 11px; color: #0B6B3A; font-weight: bold;">
              Phone: ${worker.phone} (Masked)
            </div>
          </div>
        `);

        marker.on('click', () => {
          onSelectWorker?.(worker);
        });

        marker.addTo(layerGroup);
      });
    }

    // 2. Job Markers
    if (showJobs) {
      jobs.forEach(job => {
        const isActive = activeJob?.id === job.id;
        const jobColor = '#DC2626';

        const customHtml = `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isActive ? '48px' : '40px'};
            height: ${isActive ? '48px' : '40px'};
            border-radius: 50%;
            background-color: ${jobColor};
            color: white;
            box-shadow: 0 4px 16px rgba(220, 38, 38, 0.45);
            border: 3px solid #ffffff;
            cursor: pointer;
            ${isActive ? 'animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;' : ''}
          ">
            <span style="font-size: ${isActive ? '22px' : '18px'};">📍</span>
            ${isActive ? '<span style="position: absolute; top: -5px; right: -5px; width: 14px; height: 14px; background: #EAB308; border-radius: 50%; border: 2px solid #fff;"></span>' : ''}
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'custom-job-pin',
          iconSize: [isActive ? 48 : 40, isActive ? 48 : 40],
          iconAnchor: [isActive ? 24 : 20, isActive ? 24 : 20],
        });

        const marker = L.marker([job.latitude, job.longitude], { icon });

        marker.bindPopup(`
          <div style="font-family: inherit; min-width: 200px; text-align: left; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: #991B1B;">${job.title}</strong>
              <span style="background: #FEE2E2; color: #991B1B; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: bold;">
                ${job.urgency.toUpperCase()}
              </span>
            </div>
            <div style="font-size: 12px; color: #374151; margin-bottom: 3px;">
              📍 Area: <strong>${job.area}</strong> (${job.city})
            </div>
            <div style="font-size: 13px; color: #0B6B3A; font-weight: bold; margin-bottom: 4px;">
              Offered: ₨ ${job.offered_rate_pkr.toLocaleString()}
            </div>
            <div style="font-size: 11px; color: #6B7280; margin-bottom: 4px;">
              Hirer: ${job.hirer_name}
            </div>
          </div>
        `);

        marker.on('click', () => {
          onSelectJob?.(job);
        });

        marker.addTo(layerGroup);
      });
    }

    // Connect line if both activeJob and selectedWorker exist
    if (activeJob && selectedWorker && mapInstanceRef.current) {
      const latlngs: [number, number][] = [
        [activeJob.latitude, activeJob.longitude],
        [selectedWorker.latitude, selectedWorker.longitude],
      ];

      const polyline = L.polyline(latlngs, {
        color: '#0B6B3A',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.8,
      }).addTo(layerGroup);

      // Fit bounds nicely
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [workers, jobs, activeJob, selectedWorker, filterSkill, showWorkers, showJobs]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-lg border border-gray-200">
      {/* Map Control Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-md border border-gray-200/80 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-emerald-800" />
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Live Chowk Map
          </span>
        </div>

        {/* Skill filter */}
        <div className="flex flex-wrap gap-1 mb-2.5">
          <button
            onClick={() => setFilterSkill('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              filterSkill === 'all'
                ? 'bg-[#0B6B3A] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({workers.length})
          </button>
          {Object.entries(SKILL_WAGE_BENCHMARKS).slice(0, 5).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setFilterSkill(key)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                filterSkill === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{val.icon}</span>
              <span>{val.labelEn.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-700 pt-2 border-t border-gray-100">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showWorkers}
              onChange={e => setShowWorkers(e.target.checked)}
              className="accent-[#0B6B3A] rounded-sm"
            />
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Workers
            </span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showJobs}
              onChange={e => setShowJobs(e.target.checked)}
              className="accent-red-600 rounded-sm"
            />
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-red-600" /> Active Jobs
            </span>
          </label>
        </div>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl text-[11px] font-semibold text-gray-700 shadow-md border border-gray-200 flex items-center gap-2">
        <Navigation className="w-3.5 h-3.5 text-emerald-700" />
        <span>Karachi Chowk Real-Time GPS Hub</span>
      </div>

      {/* Leaflet DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
