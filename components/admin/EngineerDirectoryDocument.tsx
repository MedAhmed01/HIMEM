import { formatMatricule } from '@/lib/matricule'

interface DirectoryEngineer {
  id: string
  nni: string
  matricule?: string | null
  full_name: string
  email: string
  phone: string
  diploma: string
  grad_year: number
  status: string
  profile_image_url?: string
  university?: string
  country?: string
  domain?: string[]
}

interface EngineerDirectoryDocumentProps {
  engineers: DirectoryEngineer[]
}

// 2 colonnes × 5 rangées : les fiches raccourcies tiennent en ~750px de haut.
const ENGINEERS_PER_PAGE = 10

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function chunkEngineers(engineers: DirectoryEngineer[]) {
  const chunks: DirectoryEngineer[][] = []
  for (let index = 0; index < engineers.length; index += ENGINEERS_PER_PAGE) {
    chunks.push(engineers.slice(index, index + ENGINEERS_PER_PAGE))
  }
  return chunks
}

function EngineerEntry({ engineer }: { engineer: DirectoryEngineer }) {
  return (
    <article className="directory-engineer-entry">
      <div className="directory-entry-heading">
        <div className="directory-photo-frame">
          {engineer.profile_image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element -- User profile photos are remote assets included in the generated PDF. */
            <img src={engineer.profile_image_url} alt={`Portrait de ${engineer.full_name}`} />
          ) : (
            <div className="directory-photo-fallback">{getInitials(engineer.full_name)}</div>
          )}
        </div>
        <div className="directory-entry-identity">
          <span className="directory-entry-number">Matricule {formatMatricule(engineer.matricule)}</span>
          <h3>{engineer.full_name}</h3>
        </div>
      </div>

      <dl className="directory-entry-details">
        <div><dt>NNI</dt><dd>{engineer.nni || '—'}</dd></div>
        <div><dt>Promotion</dt><dd>{engineer.grad_year || '—'}</dd></div>
        <div><dt>Téléphone</dt><dd>{engineer.phone || '—'}</dd></div>
      </dl>
    </article>
  )
}

export default function EngineerDirectoryDocument({ engineers }: EngineerDirectoryDocumentProps) {
  const year = new Date().getFullYear()
  const generatedDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const engineerPages = chunkEngineers(engineers)
  const uniqueDomains = new Set(engineers.flatMap((engineer) => engineer.domain || [])).size
  const uniqueCountries = new Set(engineers.map((engineer) => engineer.country).filter(Boolean)).size
  const totalPages = engineerPages.length + 1

  return (
    <div className="engineer-directory-document">
      <section className="engineer-directory-page engineer-directory-cover">
        <div className="directory-cover-orbit directory-cover-orbit-one" />
        <div className="directory-cover-orbit directory-cover-orbit-two" />
        <div className="directory-cover-header">
          {/* eslint-disable-next-line @next/next/no-img-element -- Reuses the official transparent OMIGEC logo. */}
          <img src="/Logo.png" alt="OMIGEC" />
          <span>ÉDITION {year}</span>
        </div>

        <div className="directory-cover-content">
          <p className="directory-cover-kicker">Répertoire professionnel officiel</p>
          <h1>ANNUAIRE<br />DES INGÉNIEURS</h1>
          <div className="directory-cover-rule" />
          <p className="directory-cover-subtitle">
            Ordre Mauritanien des Ingénieurs en Génie Civil
          </p>
        </div>

        <div className="directory-cover-stats">
          <div><strong>{engineers.length}</strong><span>Ingénieurs</span></div>
          <div><strong>{uniqueDomains || 1}</strong><span>Domaines</span></div>
          <div><strong>{uniqueCountries || 1}</strong><span>Pays représentés</span></div>
        </div>

        <footer className="directory-cover-footer">
          <span>Nouakchott · Mauritanie</span>
          <span>Généré le {generatedDate}</span>
        </footer>
      </section>

      {engineerPages.map((pageEngineers, pageIndex) => (
        <section key={pageIndex} className="engineer-directory-page engineer-directory-list-page">
          <header className="directory-page-header">
            {/* eslint-disable-next-line @next/next/no-img-element -- Reuses the official transparent OMIGEC logo. */}
            <img src="/Logo.png" alt="OMIGEC" />
            <div>
              <span>ANNUAIRE PROFESSIONNEL</span>
              <strong>{year}</strong>
            </div>
          </header>

          <div className="directory-page-title">
            <div>
              <span>RÉPERTOIRE</span>
              <h2>Ingénieurs membres</h2>
            </div>
            <p>{engineers.length} profils</p>
          </div>

          {/* Une page complète répartit ses rangées sur toute la hauteur pour
              éviter le grand vide en bas ; la dernière page (incomplète) garde
              un espacement normal. */}
          <div className={`directory-engineer-grid${
            pageEngineers.length === ENGINEERS_PER_PAGE ? ' directory-engineer-grid-full' : ''
          }`}>
            {pageEngineers.map((engineer) => (
              <EngineerEntry key={engineer.id} engineer={engineer} />
            ))}
          </div>

          <footer className="directory-page-footer">
            <span>OMIGEC · Annuaire officiel des ingénieurs</span>
            <span>{pageIndex + 2} / {totalPages}</span>
          </footer>
        </section>
      ))}
    </div>
  )
}
