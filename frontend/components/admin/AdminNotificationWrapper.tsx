'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, BellRing, X, Trash2, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import styles from './AdminNotification.module.css';

// Play a soft notification sound using Web Audio API (no file needed, 100% free)
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);          // High note
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);    // Mid note

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Browser may block audio without user interaction — silently fail
  }
}

export default function AdminNotificationWrapper() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showCenter, setShowCenter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsClient(true);
    if (!pathname?.startsWith('/admin')) return;

    // 1. Fetch initial notifications from Backend API
    api.notifications.list().then(loadedNotes => {
      setNotifications(loadedNotes);
    }).catch(console.error);

    // 2. Subscribe to Supabase Realtime for new notifications
    const salonUser = localStorage.getItem('salon_user');
    const salonId = salonUser ? JSON.parse(salonUser).salonId : null;

    const channel = supabase
      .channel('public:Notification')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: salonId ? `salonId=eq.${salonId}` : undefined,
        },
        (payload) => {
          const newNote = payload.new;
          // Add to list and play sound — no toast, no popup
          setNotifications(prev => [newNote, ...prev]);
          playNotificationSound();
        }
      )
      .subscribe();

    // Global mock function for easy testing
    (window as any).simulateNewNotification = () => {
      api.notifications.create({
        salonId: salonId || 'TEST_SALON_ID',
        type: 'APPOINTMENT',
        title: 'New Online Booking',
        message: 'A new client just booked a Balayage service.'
      }).catch(console.error);
    };

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  if (!isClient || !pathname?.startsWith('/admin')) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleOpenCenter = () => setShowCenter(true);

  const handleDelete = async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await api.notifications.deleteAll();
        setNotifications([]);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      await api.notifications.markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Floating Bell Widget */}
      <div className={styles.widgetContainer}>
        <button
          className={styles.widgetButton}
          onClick={handleOpenCenter}
          aria-label="Notifications"
        >
          {unreadCount > 0 ? <BellRing size={24} /> : <Bell size={24} />}
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>

      {/* Slide-over Notification Center */}
      {showCenter && (
        <>
          <div className={styles.slideOverOverlay} onClick={() => setShowCenter(false)} />
          <div className={styles.slideOverPanel}>
            <div className={styles.slideOverHeader}>
              <div>
                <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-serif)' }}>Notifications</h2>
                {unreadCount > 0 && (
                  <p style={{ fontSize: '12px', color: '#c59d5f', marginTop: '2px' }}>
                    {unreadCount} unread
                  </p>
                )}
              </div>
              <button className={styles.closeButton} onClick={() => setShowCenter(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Search and Action Bar */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--bg-panel)'
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                style={{
                  flex: 1,
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: 'var(--white)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#c59d5f'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    borderRadius: 'var(--r-md)',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            <div className={styles.notificationList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell size={48} opacity={0.2} />
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>All Caught Up</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No new notifications at this time.</p>
                </div>
              ) : notifications.filter(note => 
                  note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  note.message?.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                <div className={styles.emptyState}>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No notifications match your search.</p>
                </div>
              ) : (
                notifications
                  .filter(note => 
                    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    note.message?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(note => (
                    <div
                      key={note.id}
                      className={`${styles.notificationItem} ${!note.isRead ? styles.unread : ''}`}
                      onMouseEnter={() => !note.isRead && markAsRead(note.id)}
                    >
                      <div className={styles.notificationIcon}>
                        <Info size={20} />
                      </div>
                      <div className={styles.notificationContent}>
                        <h4 className={styles.notificationTitle}>{note.title}</h4>
                        <p className={styles.notificationMessage}>{note.message}</p>
                        <p className={styles.notificationTime}>
                          {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
