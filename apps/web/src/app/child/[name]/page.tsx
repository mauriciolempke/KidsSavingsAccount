'use client';

import { useParams } from 'next/navigation';
import ChildDashboard from '../../../components/child/ChildDashboard';

export default function ChildPage() {
  const params = useParams();
  const childName = params.name as string;

  return <ChildDashboard childName={decodeURIComponent(childName)} />;
}

