import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    
    if (!address) {
      return Response.json(
        { error: 'Address is required' }, 
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get parcel data
    const { data: parcel, error } = await supabase
      .from('parcels')
      .select('*')
      .ilike('address', `%${address}%`)
      .single();
    
    if (error || !parcel) {
      return Response.json(
        { error: 'Parcel not found' }, 
        { status: 404 }
      );
    }
    
    // Calculate max units
    const maxUnits = calculateMaxUnits(parcel);
    
    return Response.json({ 
      maxUnits, 
      parcel,
      calculation: {
        baseUnits: Math.floor(parcel.lot_size_sf / (parcel.zoning_data?.min_lot_per_unit || 5000)),
        sb9Bonus: parcel.zoning_data?.sb9_eligible ? 1 : 0
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

function calculateMaxUnits(parcel: any): number {
  const baseUnits = Math.floor(
    parcel.lot_size_sf / (parcel.zoning_data?.min_lot_per_unit || 5000)
  );
  
  // Add SB9 bonus if eligible
  const sb9Bonus = parcel.zoning_data?.sb9_eligible ? 1 : 0;
  
  return baseUnits + sb9Bonus;
}
