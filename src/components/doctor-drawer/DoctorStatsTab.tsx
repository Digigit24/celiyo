// src/components/doctor-drawer/DoctorStatsTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Star, Calendar, TrendingUp, Clock, DollarSign } from 'lucide-react';
import type { Doctor } from '@/types/doctor.types';
import { format } from 'date-fns';

interface DoctorStatsTabProps {
  doctor: Doctor;
}

export default function DoctorStatsTab({ doctor }: DoctorStatsTabProps) {
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getLicenseStatus = () => {
    if (doctor.is_license_valid === null) {
      return { text: 'Status Unknown', color: 'bg-gray-500' };
    }
    return doctor.is_license_valid 
      ? { text: 'Valid', color: 'bg-emerald-500' }
      : { text: 'Expired', color: 'bg-red-500' };
  };

  const licenseStatus = getLicenseStatus();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctor.total_consultations}</div>
            <p className="text-xs text-muted-foreground mt-1">All time consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {parseFloat(doctor.average_rating).toFixed(1)}
              <span className="text-amber-500">⭐</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {doctor.total_reviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctor.years_of_experience}</div>
            <p className="text-xs text-muted-foreground mt-1">Years of practice</p>
          </CardContent>
        </Card>
      </div>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Medical License</p>
              <p className="font-medium">{doctor.medical_license_number || 'Not provided'}</p>
              <div className="mt-2">
                <Badge className={licenseStatus.color}>
                  {licenseStatus.text}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Specialties</p>
              <div className="flex flex-wrap gap-1">
                {doctor.specialties.map((specialty) => (
                  <Badge key={specialty.id} variant="outline">
                    {specialty.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Qualifications</p>
              <p className="font-medium">{doctor.qualifications || 'Not provided'}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge
                variant={doctor.status === 'active' ? 'default' : 'secondary'}
                className={
                  doctor.status === 'active'
                    ? 'bg-emerald-500'
                    : doctor.status === 'on_leave'
                    ? 'bg-amber-500'
                    : ''
                }
              >
                {doctor.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Consultation Fees & Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Consultation Fee</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(doctor.consultation_fee)}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Follow-up Fee</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(doctor.follow_up_fee)}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Duration
              </p>
              <p className="text-xl font-bold">{doctor.consultation_duration} min</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Availability Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {doctor.is_available_online && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  Available Online
                </div>
              </Badge>
            )}
            {doctor.is_available_offline && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  Available Offline
                </div>
              </Badge>
            )}
            {!doctor.is_available_online && !doctor.is_available_offline && (
              <p className="text-sm text-muted-foreground">No availability set</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* License Details */}
      {doctor.medical_license_number && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              License Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">License Number</p>
                <p className="font-medium">{doctor.medical_license_number}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Issuing Authority</p>
                <p className="font-medium">
                  {doctor.license_issuing_authority || 'Not provided'}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Issue Date</p>
                <p className="font-medium">{formatDate(doctor.license_issue_date)}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Expiry Date</p>
                <p className="font-medium">{formatDate(doctor.license_expiry_date)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">User ID</p>
              <p className="font-medium">{doctor.user.id}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Username</p>
              <p className="font-medium">{doctor.user.username}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{doctor.user.email}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Role</p>
              <p className="font-medium">{doctor.user.groups.join(', ')}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Account Status</p>
              <Badge variant={doctor.user.is_active ? 'default' : 'secondary'}>
                {doctor.user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Verified</p>
              <Badge variant={doctor.user.is_verified ? 'default' : 'outline'}>
                {doctor.user.is_verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Profile Created</p>
              <p className="font-medium">{formatDate(doctor.created_at)}</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">User Account Created</p>
              <p className="font-medium">{formatDate(doctor.user.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}