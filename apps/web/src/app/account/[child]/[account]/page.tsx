'use client';

import { useParams } from 'next/navigation';
import AccountView from '../../../../components/account/AccountView';

export default function AccountPage() {
  const params = useParams();
  const childName = params.child as string;
  const accountName = params.account as string;

  return (
    <AccountView 
      childName={decodeURIComponent(childName)} 
      accountName={decodeURIComponent(accountName)} 
    />
  );
}

