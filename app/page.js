"use client"
import { useEffect, useState } from 'react';
import UserStats from '@/components/UserStats';
import { fetchContractData } from '@/lib/features/contractDataInteractSlice';
import Link from 'next/link';
import Dashboard from './dashboard/page';

export default function Home() {
  
  return (
    <div>
      <div>
        <Dashboard />
      </div>
    </div>
  );
}
