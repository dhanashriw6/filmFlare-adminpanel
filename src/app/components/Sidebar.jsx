'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

/* ─── Nav config ────────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    sectionLabel: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        ),
      },
    ],
  },
  //   {
  //     sectionLabel: 'Management',
  //     items: [
  //       {
  //         id: 'photographers',
  //         label: 'Photographers',
  //         icon: (
  //           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  //             <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
  //             <circle cx="12" cy="13" r="4" />
  //           </svg>
  //         ),
  //         children: [
  //           {
  //             id: 'photographers-list',
  //             label: 'All Photographers',
  //             href: '/photographers',
  //             icon: (
  //               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //                 <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  //                 <circle cx="9" cy="7" r="4" />
  //                 <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  //                 <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  //               </svg>
  //             ),
  //           },
  //           {
  //             id: 'photographers-pending',
  //             label: 'Pending Approvals',
  //             href: '/photographers/pending',
  //             icon: (
  //               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //                 <circle cx="12" cy="12" r="10" />
  //                 <polyline points="12 6 12 12 16 14" />
  //               </svg>
  //             ),
  //           },
  //         ],
  //       },
  //       {
  //         id: 'bookings',
  //         label: 'Bookings',
  //         icon: (
  //           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  //             <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
  //             <line x1="16" y1="2" x2="16" y2="6" />
  //             <line x1="8" y1="2" x2="8" y2="6" />
  //             <line x1="3" y1="10" x2="21" y2="10" />
  //           </svg>
  //         ),
  //         children: [
  //           {
  //             id: 'bookings-list',
  //             label: 'All Bookings',
  //             href: '/bookings',
  //             icon: (
  //               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  //                 <polyline points="14 2 14 8 20 8" />
  //                 <line x1="16" y1="13" x2="8" y2="13" />
  //                 <line x1="16" y1="17" x2="8" y2="17" />
  //               </svg>
  //             ),
  //           },
  //           {
  //             id: 'bookings-transactions',
  //             label: 'Transactions',
  //             href: '/bookings/transactions',
  //             icon: (
  //               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  //                 <line x1="12" y1="1" x2="12" y2="23" />
  //                 <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  //               </svg>
  //             ),
  //           },
  //         ],
  //       },
  //     ],
  //   },
  {
    sectionLabel: 'Configuration',
    items: [
      {
        id: 'masters',
        label: 'Masters',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="7" height="7" rx="1.5" />
            <rect x="15" y="3" width="7" height="7" rx="1.5" />
            <rect x="2" y="14" width="7" height="7" rx="1.5" />
            <rect x="15" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
        children: [
          {
            id: 'users',
            label: 'Users List',
            href: '/masters/user-list',
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            ),
          },
          {
            id: 'users-kyc',
            label: 'User Kyc Verification',
            href: '/masters/users',
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            ),
          },
          {
            id: 'bank-details',
            label: 'Bank Details',
            href: '/masters/bank',
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M4 10h16" />
                <path d="M4 16h16" />
              </svg>
            ),
          },
          {
            id: 'event-package',
            label: 'Event Package',
            href: '/masters/event-package',
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            ),
          },
          {
            id: 'master-event-category',
            label: 'Master Event Category',
            href: '/masters/event-category',
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
            ),
          },
          {
            id: 'commission',
            label: 'Commission',
            href: '/masters/commission',
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            ),
          },
        ],
      },
      // {
      //   id: 'settings',
      //   label: 'Settings',
      //   href: '/settings',
      //   icon: (
      //     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      //       <circle cx="12" cy="12" r="3" />
      //       <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      //     </svg>
      //   ),
      // },
    ],
  },
];

/* ─── Sidebar ───────────────────────────────────────────────── */
const Sidebar = ({ collapsed, onToggle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState({ masters: true, photographers: false, bookings: false });

  const toggleGroup = (id) => {
    if (collapsed) return;
    setOpenGroups((p) => ({ ...p, [id]: !p[id] }));
  };

  const isChildActive = (item) =>
    item.children?.some((c) => pathname?.startsWith(c.href));

  return (
    <aside className={`sb${collapsed ? ' sb--collapsed' : ''}`}>

      {/* ── Logo bar ── */}
      <div className="sb-logo-bar">
        {/* <div className="sb-logo-mark">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
        </div> */}
        {!collapsed && (
          <div className="sb-logo-text">
            <span className="sb-logo-name">FilmFlare</span>
            <span className="sb-logo-sub">Admin Panel</span>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="sb-nav">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="sb-section">
            {/* {!collapsed && (
              <p className="sb-section-label">{section.sectionLabel}</p>
            )} */}

            {section.items.map((item) => {
              const hasChildren = !!item.children;
              const open = openGroups[item.id];
              const active = hasChildren
                ? isChildActive(item)
                : (pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)));

              return (
                <div key={item.id} className="sb-group">
                  {/* Group trigger / Direct link */}
                  <button
                    className={`sb-trigger${active ? ' sb-trigger--active' : ''}`}
                    onClick={() => {
                      if (hasChildren) {
                        toggleGroup(item.id);
                      } else {
                        router.push(item.href);
                      }
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && <span className="sb-trigger-bar" />}
                    <span className={`sb-trigger-icon${active ? ' sb-trigger-icon--active' : ''}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="sb-trigger-label">{item.label}</span>
                        {hasChildren && (
                          <span className={`sb-trigger-chevron${open ? ' sb-trigger-chevron--open' : ''}`}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        )}
                      </>
                    )}
                  </button>

                  {/* Children */}
                  {!collapsed && open && hasChildren && (
                    <div className="sb-children">
                      {/* Vertical rail */}
                      <span className="sb-rail" />
                      <div className="sb-children-list">
                        {item.children.map((child) => {
                          const ca = pathname?.startsWith(child.href);
                          return (
                            <button
                              key={child.id}
                              className={`sb-child${ca ? ' sb-child--active' : ''}`}
                              onClick={() => router.push(child.href)}
                            >
                              <span className="sb-child-dot">{ca && <span className="sb-child-dot-inner" />}</span>
                              <span className={`sb-child-icon${ca ? ' sb-child-icon--active' : ''}`}>
                                {child.icon}
                              </span>
                              <span className="sb-child-label">{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User card + collapse ── */}
      <div className="sb-footer">
        {!collapsed ? (
          <div className="sb-user">
            {/* <div className="sb-user-avatar">SA</div> */}
            <div className="sb-user-info">
              <span className="sb-user-name">Super Admin</span>
              <span className="sb-user-role">Administrator</span>
            </div>
            <button className="sb-collapse-btn" onClick={onToggle} aria-label="Collapse sidebar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
        ) : (
          <button className="sb-collapse-btn sb-collapse-btn--solo" onClick={onToggle} aria-label="Expand sidebar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;