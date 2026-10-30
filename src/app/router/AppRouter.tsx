import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { HomePage } from '../../features/home/HomePage';
import { EventsPage } from '../../features/events/EventsPage';
import { VenuesPage } from '../../features/venues/VenuesPage';
import { MemoriesPage } from '../../features/memories/MemoriesPage';
import { InvitationPage } from '../../features/invitation/InvitationPage';
import { RsvpPage } from '../../features/rsvp/RsvpPage';
import { AdminPage } from '../../features/administration/AdminPage';
import { NotFoundPage } from '../../features/not-found/NotFoundPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />

      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="venues" element={<VenuesPage />} />
        <Route path="memories" element={<MemoriesPage />} />
        <Route path="invitation" element={<InvitationPage />} />
        <Route path="rsvp" element={<RsvpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
