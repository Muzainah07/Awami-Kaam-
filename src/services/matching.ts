import { WorkerProfile, JobListing, WorkerMatch, MatchScoreBreakdown } from '../types';

/**
 * Calculate distance between two coordinates using the Haversine formula (km)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Keyword & semantic similarity fallback (0 to 1)
 */
function computeSemanticOverlap(job: JobListing, worker: WorkerProfile): number {
  const jobText = `${job.title} ${job.job_type} ${job.special_requirements} ${job.job_size}`.toLowerCase();
  let matches = 0;
  const terms = [...worker.skills, worker.primary_skill];
  for (const skill of terms) {
    if (jobText.includes(skill.toLowerCase())) matches++;
  }
  return Math.min(1.0, 0.4 + matches * 0.25);
}

/**
 * Hybrid matching engine
 */
export function scoreWorkerForJob(worker: WorkerProfile, job: JobListing): MatchScoreBreakdown {
  // 1. Skill Match (0-30 points)
  let skillMatch = 0;
  if (worker.primary_skill === job.skill_needed) {
    skillMatch = 30;
  } else if (worker.skills.some(s => s.toLowerCase().includes(job.skill_needed))) {
    skillMatch = 24;
  } else if (job.skill_needed === 'laborer') {
    // Almost any skilled worker can do basic laborer work if needed
    skillMatch = 18;
  } else {
    skillMatch = 5;
  }

  // 2. Proximity via Haversine (0-25 points)
  const distance_km = calculateHaversineDistance(
    worker.latitude,
    worker.longitude,
    job.latitude,
    job.longitude
  );

  let proximity = 0;
  if (distance_km <= 2) proximity = 25;
  else if (distance_km <= 5) proximity = 22;
  else if (distance_km <= 10) proximity = 17;
  else if (distance_km <= 15) proximity = 12;
  else if (distance_km <= 25) proximity = 6;
  else proximity = 2;

  // 3. Availability Match (0-15 points)
  let availability = 0;
  if (worker.availability === job.date) {
    availability = 15;
  } else if (worker.availability === 'today' && job.date === 'tomorrow') {
    availability = 11;
  } else if (worker.availability === 'this_week') {
    availability = 10;
  } else {
    availability = 5;
  }

  // 4. Reliability Score (0-15 points)
  // worker.reliability_score is on a 0-5 scale
  const reliability = Math.round((Math.min(5, worker.reliability_score) / 5) * 15);

  // 5. Semantic Similarity (0-15 points)
  const semanticRatio = computeSemanticOverlap(job, worker);
  const semantic = Math.round(semanticRatio * 15);

  const total = Math.min(100, skillMatch + proximity + availability + reliability + semantic);

  // Generate clear reason explanation
  let explanation = '';
  if (skillMatch === 30 && distance_km <= 5) {
    explanation = `Top skill match in ${worker.location_area} (${distance_km}km away) with ${worker.experience_years} years experience.`;
  } else if (distance_km <= 3) {
    explanation = `Hyper-local ${worker.primary_skill} just ${distance_km}km from job site, available ${worker.availability}.`;
  } else if (worker.reliability_score >= 4.8) {
    explanation = `Highly-rated master artisan (${worker.reliability_score}★) with ${worker.completed_jobs_count} verified jobs.`;
  } else {
    explanation = `Qualified ${worker.primary_skill} matching required tools and job specifications.`;
  }

  return {
    skillMatch,
    proximity,
    availability,
    reliability,
    semantic,
    total,
    distance_km,
    explanation,
  };
}

/**
 * Rank top matching workers for a given job
 */
export function rankWorkersForJob(
  job: JobListing,
  workers: WorkerProfile[],
  limit = 5
): WorkerMatch[] {
  const scored = workers.map(worker => ({
    worker,
    score: scoreWorkerForJob(worker, job),
  }));

  // Sort descending by total score
  scored.sort((a, b) => b.score.total - a.score.total);

  return scored.slice(0, limit);
}
