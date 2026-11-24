import { useEffect, useState, type ReactNode } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PackageTag } from '@/components/PackageTag'
import { ACCESS_OPTIONS, type SectionId } from '@/pages/admin/profile-sections'
import { cn } from '@/lib/utils'
import { confirmDialog } from '@/stores/confirm-dialog-store'
import { useShopProfileStore } from '@/stores/shop-profile-store'
import type { Branch, CompanyProfile, PackageTier, ProprietorProfile, StaffAccessProfile } from '@/types'

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="profile-detail-row">
      <dt className="profile-detail-label">{label}</dt>
      <dd className="profile-detail-value">{value}</dd>
    </div>
  )
}

function PanelActions({
  editing,
  onEdit,
  onSave,
  onCancel,
  canDelete,
  onDelete,
}: {
  editing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  canDelete?: boolean
  onDelete?: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {editing ? (
        <>
          <button type="button" className="btn-primary !h-9 px-4 text-xs" onClick={onSave}>
            Save
          </button>
          <button type="button" className="btn-secondary !h-9 px-4 text-xs" onClick={onCancel}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <button type="button" className="btn-secondary !h-9 px-4 text-xs" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          {canDelete && onDelete ? (
            <button type="button" className="btn-danger !h-9 px-4 text-xs" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          ) : null}
        </>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  editing,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  editing: boolean
  multiline?: boolean
}) {
  if (!editing) return <DetailRow label={label} value={value || '—'} />
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="profile-detail-label !text-[11px]">{label}</span>
      {multiline ? (
        <textarea
          className="input-field min-h-[4.5rem] resize-y py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className="input-field !h-10" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

function SectionShell({
  title,
  editing,
  onEdit,
  onSave,
  onCancel,
  children,
  extra,
}: {
  title: string
  editing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  children: ReactNode
  extra?: ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-h2">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {extra}
          <PanelActions editing={editing} onEdit={onEdit} onSave={onSave} onCancel={onCancel} />
        </div>
      </div>
      <div className="profile-detail-grid space-y-3">{children}</div>
    </div>
  )
}

function emptyBranch(shopId: string): Omit<Branch, 'id'> {
  return {
    shopId,
    name: 'New branch',
    code: 'N',
    city: 'Ambur',
    addressLine1: '',
    state: 'Tamil Nadu',
    pincode: '',
    phone: '',
  }
}

function emptyStaff(): Omit<StaffAccessProfile, 'id'> {
  return {
    name: 'New user',
    role: 'Staff',
    email: 'user@demo.local',
    branchIds: 'all',
    access: ['Dashboard'],
    status: 'active',
  }
}

interface ProfileSectionCrudProps {
  section: SectionId
  email: string
  partnerBrand: string
  packageTier: PackageTier
  shopId: string
}

export function ProfileSectionCrud(props: ProfileSectionCrudProps) {
  const { section, email, partnerBrand, packageTier, shopId } = props

  const company = useShopProfileStore((s) => s.company)
  const proprietor = useShopProfileStore((s) => s.proprietor)
  const branches = useShopProfileStore((s) => s.branches)
  const staff = useShopProfileStore((s) => s.staff)
  const updateCompany = useShopProfileStore((s) => s.updateCompany)
  const updateProprietor = useShopProfileStore((s) => s.updateProprietor)
  const addBranch = useShopProfileStore((s) => s.addBranch)
  const updateBranch = useShopProfileStore((s) => s.updateBranch)
  const deleteBranch = useShopProfileStore((s) => s.deleteBranch)
  const addStaff = useShopProfileStore((s) => s.addStaff)
  const updateStaff = useShopProfileStore((s) => s.updateStaff)
  const deleteStaff = useShopProfileStore((s) => s.deleteStaff)
  const resetFromDemo = useShopProfileStore((s) => s.resetFromDemo)

  const [editing, setEditing] = useState(false)
  const [draftCompany, setDraftCompany] = useState<CompanyProfile | null>(company)
  const [draftProp, setDraftProp] = useState<ProprietorProfile | null>(proprietor)
  const [branchEditId, setBranchEditId] = useState<string | null>(null)
  const [draftBranch, setDraftBranch] = useState<Branch | null>(null)
  const [staffEditId, setStaffEditId] = useState<string | null>(null)
  const [draftStaff, setDraftStaff] = useState<StaffAccessProfile | null>(null)

  useEffect(() => {
    setEditing(false)
    setBranchEditId(null)
    setStaffEditId(null)
    setDraftBranch(null)
    setDraftStaff(null)
  }, [section])

  useEffect(() => setDraftCompany(company), [company])
  useEffect(() => setDraftProp(proprietor), [proprietor])

  if (!company || !proprietor || !draftCompany || !draftProp) return null

  if (section === 'overview') {
    return (
      <div>
        <h2 className="text-h2">Account overview</h2>
        <p className="text-sm text-muted">
          Create, update, or delete records in each section. Data is stored in this browser (demo).
        </p>
        <dl className="profile-detail-grid mt-4">
          <DetailRow label="Sign-in email" value={email} />
          <DetailRow label="Trade name" value={company.tradeName} />
          <DetailRow label="Package" value={<PackageTag tier={packageTier} />} />
          <DetailRow label="Partner" value={partnerBrand} />
          <DetailRow label="Branches" value={String(branches.length)} />
          <DetailRow label="Team" value={String(staff.length)} />
        </dl>
        <button
          type="button"
          className="btn-secondary !h-9 mt-4 text-xs"
          onClick={async () => {
            const ok = await confirmDialog({
              title: 'Reset profile data?',
              message: 'All edits to company, branches, and users will be replaced with demo defaults.',
              confirmLabel: 'Reset',
              variant: 'danger',
            })
            if (ok) resetFromDemo(shopId)
          }}
        >
          Reset profile data to demo defaults
        </button>
      </div>
    )
  }

  if (section === 'company') {
    return (
      <SectionShell
        title="Company"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => {
          setDraftCompany(company)
          setEditing(false)
        }}
        onSave={() => {
          updateCompany(draftCompany)
          setEditing(false)
        }}
      >
        <Field label="Legal name" value={draftCompany.legalName} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, legalName: v })} />
        <Field label="Trade name" value={draftCompany.tradeName} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, tradeName: v })} />
        <Field label="CIN" value={draftCompany.cin ?? ''} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, cin: v })} />
        <Field label="Registered address" value={draftCompany.registeredAddress} editing={editing} multiline onChange={(v) => setDraftCompany({ ...draftCompany, registeredAddress: v })} />
        <Field label="City" value={draftCompany.city} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, city: v })} />
        <Field label="State" value={draftCompany.state} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, state: v })} />
        <Field label="PIN" value={draftCompany.pincode} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, pincode: v })} />
        <Field label="Phone" value={draftCompany.phone} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, phone: v })} />
        <Field label="Accounts email" value={draftCompany.email} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, email: v })} />
      </SectionShell>
    )
  }

  if (section === 'tax') {
    return (
      <SectionShell
        title="GST & PAN"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => {
          setDraftCompany(company)
          setEditing(false)
        }}
        onSave={() => {
          updateCompany(draftCompany)
          setEditing(false)
        }}
      >
        <Field label="GSTIN" value={draftCompany.gstin} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, gstin: v })} />
        <Field label="PAN" value={draftCompany.pan} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, pan: v })} />
        <Field label="Legal entity" value={draftCompany.legalName} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, legalName: v })} />
        <Field label="Registered state" value={draftCompany.state} editing={editing} onChange={(v) => setDraftCompany({ ...draftCompany, state: v })} />
      </SectionShell>
    )
  }

  if (section === 'proprietor') {
    return (
      <SectionShell
        title="Proprietor"
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancel={() => {
          setDraftProp(proprietor)
          setEditing(false)
        }}
        onSave={() => {
          updateProprietor(draftProp)
          setEditing(false)
        }}
      >
        <Field label="Name" value={draftProp.name} editing={editing} onChange={(v) => setDraftProp({ ...draftProp, name: v })} />
        <Field label="Designation" value={draftProp.designation} editing={editing} onChange={(v) => setDraftProp({ ...draftProp, designation: v })} />
        <Field label="Phone" value={draftProp.phone} editing={editing} onChange={(v) => setDraftProp({ ...draftProp, phone: v })} />
        <Field label="Email" value={draftProp.email} editing={editing} onChange={(v) => setDraftProp({ ...draftProp, email: v })} />
        <Field label="PAN" value={draftProp.pan ?? ''} editing={editing} onChange={(v) => setDraftProp({ ...draftProp, pan: v })} />
      </SectionShell>
    )
  }

  if (section === 'branches') {
    const branchEditing = branchEditId !== null && draftBranch !== null
    const isNew = branchEditId === '__new__'

    const startNew = () => {
      setBranchEditId('__new__')
      setDraftBranch({ ...emptyBranch(shopId), id: '__new__' })
    }

    const startEdit = (b: Branch) => {
      setBranchEditId(b.id)
      setDraftBranch({ ...b })
    }

    const cancelBranch = () => {
      setBranchEditId(null)
      setDraftBranch(null)
    }

    const saveBranch = () => {
      if (!draftBranch) return
      if (isNew) {
        const { id: _id, ...rest } = draftBranch
        addBranch(rest)
      } else {
        updateBranch(draftBranch.id, draftBranch)
      }
      cancelBranch()
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-h2">Branches</h2>
          <button type="button" className="btn-primary !h-9 px-3 text-xs" onClick={startNew} disabled={branchEditing}>
            <Plus className="h-3.5 w-3.5" />
            Add branch
          </button>
        </div>

        {branchEditing && draftBranch ? (
          <div className="profile-branch-card space-y-3">
            <p className="text-sm font-semibold text-charcoal">{isNew ? 'New branch' : 'Edit branch'}</p>
            <Field label="Name" value={draftBranch.name} editing onChange={(v) => setDraftBranch({ ...draftBranch, name: v })} />
            <Field label="Code" value={draftBranch.code} editing onChange={(v) => setDraftBranch({ ...draftBranch, code: v })} />
            <Field label="Address line 1" value={draftBranch.addressLine1 ?? ''} editing onChange={(v) => setDraftBranch({ ...draftBranch, addressLine1: v })} />
            <Field label="Address line 2" value={draftBranch.addressLine2 ?? ''} editing onChange={(v) => setDraftBranch({ ...draftBranch, addressLine2: v })} />
            <Field label="City" value={draftBranch.city} editing onChange={(v) => setDraftBranch({ ...draftBranch, city: v })} />
            <Field label="State" value={draftBranch.state ?? ''} editing onChange={(v) => setDraftBranch({ ...draftBranch, state: v })} />
            <Field label="PIN" value={draftBranch.pincode ?? ''} editing onChange={(v) => setDraftBranch({ ...draftBranch, pincode: v })} />
            <Field label="Phone" value={draftBranch.phone ?? ''} editing onChange={(v) => setDraftBranch({ ...draftBranch, phone: v })} />
            <Field label="Branch GSTIN" value={draftBranch.branchGstin ?? ''} editing onChange={(v) => setDraftBranch({ ...draftBranch, branchGstin: v })} />
            <div className="flex gap-2 pt-1">
              <button type="button" className="btn-primary !h-9 text-xs" onClick={saveBranch}>
                Save branch
              </button>
              <button type="button" className="btn-secondary !h-9 text-xs" onClick={cancelBranch}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {branches.map((b) => (
            <div key={b.id} className="profile-branch-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-charcoal">{b.name}</h3>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary !h-8 px-2 text-xs" onClick={() => startEdit(b)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger !h-8 px-2 text-xs"
                    disabled={branches.length <= 1}
                    onClick={async () => {
                      const ok = await confirmDialog({
                        title: 'Delete branch?',
                        message: `"${b.name}" will be removed from your profile. This cannot be undone in this demo.`,
                        confirmLabel: 'Delete branch',
                        variant: 'danger',
                      })
                      if (ok) deleteBranch(b.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <dl className="profile-detail-grid mt-3">
                <DetailRow label="Address" value={[b.addressLine1, b.addressLine2].filter(Boolean).join(', ') || '—'} />
                <DetailRow label="City / PIN" value={`${b.city}, ${b.state ?? '—'} — ${b.pincode ?? '—'}`} />
                <DetailRow label="Phone" value={b.phone ?? '—'} />
                {b.branchGstin ? <DetailRow label="Branch GSTIN" value={b.branchGstin} /> : null}
              </dl>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (section === 'roles') {
    const staffEditing = staffEditId !== null && draftStaff !== null
    const isNew = staffEditId === '__new__'

    const toggleAccess = (key: string) => {
      if (!draftStaff) return
      const has = draftStaff.access.includes(key)
      setDraftStaff({
        ...draftStaff,
        access: has ? draftStaff.access.filter((a) => a !== key) : [...draftStaff.access, key],
      })
    }

    const startNew = () => {
      setStaffEditId('__new__')
      setDraftStaff({ ...emptyStaff(), id: '__new__' })
    }

    const startEdit = (p: StaffAccessProfile) => {
      setStaffEditId(p.id)
      setDraftStaff({ ...p })
    }

    const cancelStaff = () => {
      setStaffEditId(null)
      setDraftStaff(null)
    }

    const saveStaff = () => {
      if (!draftStaff) return
      if (isNew) {
        const { id: _id, ...rest } = draftStaff
        addStaff(rest)
      } else {
        updateStaff(draftStaff.id, draftStaff)
      }
      cancelStaff()
    }

    return (
      <div className="space-y-4">
        <input type="hidden" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-h2">Roles & access</h2>
          <button type="button" className="btn-primary !h-9 px-3 text-xs" onClick={startNew} disabled={staffEditing}>
            <Plus className="h-3.5 w-3.5" />
            Add user
          </button>
        </div>

        {staffEditing && draftStaff ? (
          <div className="profile-branch-card space-y-3">
            <p className="text-sm font-semibold text-charcoal">{isNew ? 'New user' : 'Edit user'}</p>
            <Field label="Name" value={draftStaff.name} editing onChange={(v) => setDraftStaff({ ...draftStaff, name: v })} />
            <Field label="Role" value={draftStaff.role} editing onChange={(v) => setDraftStaff({ ...draftStaff, role: v })} />
            <Field label="Email" value={draftStaff.email} editing onChange={(v) => setDraftStaff({ ...draftStaff, email: v })} />
            <label className="block space-y-1.5 text-sm">
              <span className="profile-detail-label !text-[11px]">Branch scope</span>
              <select
                className="input-field !h-10"
                value={draftStaff.branchIds === 'all' ? 'all' : draftStaff.branchIds[0]}
                onChange={(e) => {
                  const v = e.target.value
                  setDraftStaff({
                    ...draftStaff,
                    branchIds: v === 'all' ? 'all' : [v],
                  })
                }}
              >
                <option value="all">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <p className="profile-detail-label mb-2">Given access</p>
              <div className="flex flex-wrap gap-2">
                {ACCESS_OPTIONS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      'profile-mini-chip cursor-pointer',
                      draftStaff.access.includes(key) && 'profile-mini-chip--accent'
                    )}
                    onClick={() => toggleAccess(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" className="btn-primary !h-9 text-xs" onClick={saveStaff}>
                Save user
              </button>
              <button type="button" className="btn-secondary !h-9 text-xs" onClick={cancelStaff}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {staff.map((person) => (
            <div key={person.id} className="profile-branch-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-charcoal">{person.name}</p>
                  <p className="text-sm text-muted">{person.email}</p>
                </div>
                <span className="profile-mini-chip profile-mini-chip--accent">{person.role}</span>
              </div>
              <dl className="profile-detail-grid mt-3">
                <DetailRow
                  label="Branches"
                  value={
                    person.branchIds === 'all'
                      ? 'All branches'
                      : person.branchIds.map((id) => branches.find((b) => b.id === id)?.name ?? id).join(', ')
                  }
                />
                <DetailRow
                  label="Access"
                  value={
                    <div className="flex flex-wrap gap-1.5">
                      {person.access.map((a) => (
                        <span key={a} className="profile-mini-chip">
                          {a}
                        </span>
                      ))}
                    </div>
                  }
                />
              </dl>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-secondary !h-8 px-2 text-xs" onClick={() => startEdit(person)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-danger !h-8 px-2 text-xs"
                  onClick={async () => {
                    const ok = await confirmDialog({
                      title: 'Remove user?',
                      message: `"${person.name}" will lose access in this demo workspace.`,
                      confirmLabel: 'Remove user',
                      variant: 'danger',
                    })
                    if (ok) deleteStaff(person.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}