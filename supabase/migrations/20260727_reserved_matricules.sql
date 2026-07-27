-- Matricules réservés (badges OMIGEC du 02/12/2024).
--
-- Les 231 cartes professionnelles déjà imprimées associent un numéro d'ordre
-- (0001 -> 0231) à un NNI précis. Ce couple est définitif :
--   * si le porteur du NNI est (ou devient) inscrit sur la plateforme,
--     il reçoit automatiquement SON matricule réservé ;
--   * sinon le matricule reste vacant : personne d'autre ne peut l'obtenir.
--
-- Script idempotent : il peut être rejoué sans risque.

-- ---------------------------------------------------------------------------
-- 0. Pré-requis (au cas où 20260726_add_matricule.sql n'aurait pas été joué)
-- ---------------------------------------------------------------------------
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS matricule CHAR(4);
CREATE SEQUENCE IF NOT EXISTS profiles_matricule_seq START WITH 1;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_matricule ON profiles(matricule);

-- ---------------------------------------------------------------------------
-- 1. Normalisation des NNI
--    Les NNI sont saisis librement (espaces, tirets, « O » saisi à la place
--    d'un zéro). On compare toujours la forme normalisée : chiffres seuls.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION normalize_nni(txt TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $fn$
  SELECT NULLIF(
    regexp_replace(replace(upper(COALESCE(txt, '')), 'O', '0'), '[^0-9]', '', 'g'),
    ''
  );
$fn$;

-- ---------------------------------------------------------------------------
-- 2. Table des réservations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reserved_matricules (
  nni        TEXT PRIMARY KEY,
  matricule  CHAR(4) NOT NULL UNIQUE,
  full_name  TEXT,
  source     TEXT DEFAULT 'BADGES OMIGEC 02DEC2024',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE reserved_matricules IS
  'Matricules deja imprimes sur les cartes professionnelles : un matricule ne peut etre attribue qu''au NNI en regard.';

-- La table contient des NNI : lecture réservée aux administrateurs.
-- Les triggers y accèdent en SECURITY DEFINER (voir plus bas).
ALTER TABLE reserved_matricules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reserved_matricules_read" ON reserved_matricules;
DROP POLICY IF EXISTS "admins_manage_reserved_matricules" ON reserved_matricules;
CREATE POLICY "admins_manage_reserved_matricules" ON reserved_matricules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Import des 231 badges (numéro de carte <-> NNI)
-- ---------------------------------------------------------------------------
INSERT INTO reserved_matricules (nni, matricule, full_name) VALUES
  ('4572484068', '0001', 'Khalilou Youssef Diagana'),
  ('0176773383', '0002', 'Mohamed Hafed Haiba'),
  ('0136617808', '0003', 'Abdallahi Serghaini Mohameden El Hilal'),
  ('7773752661', '0004', 'Nemouh Mohamed Najem Chehlaoui'),
  ('657362793', '0005', 'Cheikhne Ebba Cheikhna'),
  ('0221356329', '0006', 'Ahmed Salem Mohamed Bacar'),
  ('6941676476', '0007', 'Idrissa Guidado Tirera'),
  ('7277670217', '0008', 'Mohameden Mohamed Abdallahi El hassene'),
  ('1235274146', '0009', 'Abdellahi Mohamed Sidina Cheikh Hamdi'),
  ('335216190', '0010', 'Brahim Mohamedou Cheikh El Hassene'),
  ('3404183282', '0011', 'El Hacen ould Mohamed Moctar'),
  ('9213263119', '0012', 'Sid El Moctar El Ghaouth Taleb'),
  ('2893091543', '0013', 'Moussa Yahye Gaye'),
  ('1109815025', '0014', 'Sidi Ahmed Baba Bebbatt'),
  ('1958047045', '0015', 'Dellahi Maloum'),
  ('2429666768', '0016', 'Souleimane Boyah'),
  ('4204569470', '0017', 'Mohamed Mahmoud Chrif M’ha med Bouassriya'),
  ('1811648728', '0018', 'Ahmedou Saleck El Mouamar'),
  ('9561598364', '0019', 'Beddou Mohamedou Saleck'),
  ('8747591145', '0020', 'Moussa El Housseynou Dia'),
  ('4173140015', '0021', 'Abdellahi Mohamedou Memah'),
  ('1881215091', '0022', 'Moulaye Hachim Baly'),
  ('2108237286', '0023', 'Mamadou Hountou Djigo'),
  ('3629617005', '0024', 'Moctar Moulaye El Hassen El Hassen'),
  ('9537928230', '0025', 'Djibirirou Mamoudou Ba'),
  ('571642341', '0026', 'Brahim Didi Sghair'),
  ('1453777607', '0027', 'Taher Mohameden Babecar'),
  ('9607971736', '0028', 'Mady Taleb M’Heidi'),
  ('2691034238', '0029', 'Abibekrine Mohamed Ahmed Weddou'),
  ('9645472324', '0030', 'Moulaye Mhamed Ahmedou Ahmed Cherif'),
  ('5532597052', '0031', 'Adama Cire Diallo'),
  ('4286668233', '0032', 'Ahmedou El Mane Abdawa'),
  ('5307911878', '0033', 'Cheikh Mame Sidi Diagne'),
  ('7906197140', '0034', 'Mohamed Taleb Mouhamedou Argueina'),
  ('8794567178', '0035', 'Ebaye Sidne Mayive'),
  ('8751224862', '0036', 'Mohamed Aly Lemane'),
  ('4143549001', '0037', 'Khaled Saleck Abdellahi'),
  ('9976840523', '0038', 'Mohamed Sidi Mohamed Ghou lam'),
  ('1164642141', '0039', 'Ahmeda Ould Mohamed Lemine'),
  ('7280989848', '0040', 'Bowbe Abdallahi Maazouz'),
  ('5152337749', '0041', 'Babbe Abderahman Abbad'),
  ('4646842425', '0042', 'Ousmane Diack'),
  ('0835311815', '0043', 'El Yedali El Ghadi Kah'),
  ('0331547941', '0044', 'El Moctar Amar'),
  ('4014078445', '0045', 'Aboubecrine Ivekou Brahim'),
  ('6561687512', '0046', 'Brahim El Khalil Selmane Moulaye El Abass'),
  ('4796527005', '0047', 'Mohamed Lemine Mohamed Abdallahi Issa'),
  ('5724937770', '0048', 'Sidi Mohamed Mohamed Abdella hi Abdel Wedoud'),
  ('4210694050', '0049', 'Ely Salem Beye Saleck'),
  ('5973241668', '0050', 'Mohamed El Mane Abdawa'),
  ('1637248354', '0051', 'Lemrabott Sidi Mahmoud Moha med Moud Eleyatt'),
  ('6979359133', '0052', 'Cheikh Tourad Cheikh Ahmed Eboulmaali'),
  ('872113033', '0053', 'Toutou Tourad Sidi'),
  ('9516811136', '0054', 'Mohamed Abderrahmane Meiloud'),
  ('8476887037', '0055', 'Mohamed Bouya Mohamed Soueidi'),
  ('7893337753', '0056', 'Ahmed Idoumou Ahmed Bouha'),
  ('5249643493', '0057', 'Oumekelthoum Brahim Veten'),
  ('8777249477', '0058', 'Brahim Bechir Hakim'),
  ('7202922017', '0059', 'Nadhirou Abdoulaye Kebé'),
  ('0429778677', '0060', 'Mariem Bemba Deidy'),
  ('1728016880', '0061', 'Mohamed Ahmed Mecha'),
  ('7200302241', '0062', 'Mohamed Abdoullah Cheyakh Cheyakh'),
  ('4425847131', '0063', 'Maham Mohamed Lemine El Mamy'),
  ('5494728058', '0064', 'Balla Cherif Bouya Ahmed Bala Cherif'),
  ('5936659282', '0065', 'Baba Elhassen Sid Elemin'),
  ('1686498940', '0066', 'Oumar M’Baye'),
  ('826723047', '0067', 'Ahmedou Vall Mohamed Sidi Abdellah'),
  ('1040566822', '0068', 'Mohamed Elhadj Baro'),
  ('8502229936', '0069', 'Mohamed Brahim Boubacar'),
  ('2717249070', '0070', 'Mohamed Elmoctar Louly'),
  ('7701861596', '0071', 'Houda Taleb'),
  ('8011845660', '0072', 'Mohamed Mahmoud EL Yedaly'),
  ('3404080268', '0073', 'Mohamed Mahmoud Mohmaed Elmahjoub Boye'),
  ('8437902058', '0074', 'Abdallahi Cheikh Mohamed Saleh'),
  ('2464274040', '0075', 'Mohamed Mahmoud Mohamed Lefdhal'),
  ('5794846834', '0076', 'Sidi Aly Sidi Verah'),
  ('3575797137', '0077', 'Cheikhna Hamada EL Kory'),
  ('1716045722', '0078', 'Brahim Hamady Cheikh Abdy Val'),
  ('0242324431', '0079', 'Ennou Tourad Sidi'),
  ('6655206667', '0080', 'Khaled Dah Khtour'),
  ('0981133079', '0081', 'Mohamed Aly Hebebane El Moctar Mbaba'),
  ('8043223220', '0082', 'Mohamed Mohamed Abdellahi Echfagha'),
  ('4280589534', '0083', 'Ahmedou Ould Mohamed Ali'),
  ('8211147195', '0084', 'Cheikh Tidjane Alioune Diallo'),
  ('5638511158', '0085', 'Issa Mohamed Abdallahi'),
  ('9753866623', '0086', 'Mohamed Nagi Cheikh Mahfoudh'),
  ('3881192131', '0087', 'Hamadi Mohamed Lemine Khou'),
  ('3698454510', '0088', 'Sidi Mohamed Dah Taleb Ahmed'),
  ('3820876173', '0089', 'Bedridine Mohameden'),
  ('5628013333', '0090', 'Cheikh Babe Mohamed Bella'),
  ('4654401441', '0091', 'Moulaye Zein Elbekay Bobacar'),
  ('6965266391', '0092', 'Yacoub Essalem'),
  ('9805738731', '0093', 'El Alarbi Ahmed Lehcen'),
  ('1595462888', '0094', 'Ouldene Ahmed Chenane'),
  ('9644533073', '0095', 'Sidati Hamady Amar'),
  ('7436807835', '0096', 'Abdel vetah El Hacen'),
  ('2143412105', '0097', 'Zeynebou Mohamed El Mokhtar Moulay'),
  ('1096924307', '0098', 'Mohmaed Mohamed El Mousta pha Sidi'),
  ('5022705300', '0099', 'Elhadj Abdallah Cheikh Abdallahi'),
  ('5201773702', '0100', 'Mouhamedou Dah Khtour'),
  ('3999216105', '0101', 'Nema Mohamed Abdallahi Ebety'),
  ('9511174466', '0102', 'Bebeha Ould Sidi Baba'),
  ('1160706560', '0103', 'Mohamed Moctar Mohamed'),
  ('9070630148', '0104', 'Abdi Ahmed Eleyatt'),
  ('4464229837', '0105', 'Mohamed Ould Yahya Ould Ahmdi'),
  ('4680418490', '0106', 'Youssouf Abderahmane'),
  ('2318219394', '0107', 'Nouha Sidi Hamed'),
  ('4707315717', '0108', 'Ahmed Mohamed Lemine Moha med Salek'),
  ('3500135488', '0109', 'Gandega Amara Yero'),
  ('9002341857', '0110', 'Sidi Mohamed Mohamed Lemine Ould Sidi Abdoulah'),
  ('4516389550', '0111', 'Limam El Aghoub'),
  ('6014215729', '0112', 'Mohamed Mahmoud Sidi Moh maed Sid Ahmed'),
  ('7539959478', '0113', 'Essed Mohamed Elyedaly'),
  ('1891057875', '0114', 'Cira Wedou Cheikh Ahmed'),
  ('3758919945', '0115', 'Mohameden Ahmedou Elkory'),
  ('5430002868', '0116', 'Elhadj Abdellah Mohamed Yahya Bah'),
  ('5077068368', '0117', 'Zein Abidine Moctar Elbou'),
  ('7055362028', '0118', 'Ahmed Mohamed Abdellahi Neine'),
  ('1165256151', '0119', 'El Hadj Ould Edhmine'),
  ('6123067965', '0120', 'Mohamed Lemrabott Yeba'),
  ('9589148207', '0121', 'Mohamed Mohamed Salem El Mamoune'),
  ('5936582264', '0122', 'Mohamed Abdelkader Ahmed Bezeid'),
  ('0411578567', '0123', 'Abdellahi Mohamed El Hacen Bouhoubeiny'),
  ('7930854152', '0124', 'Salma Deyman Mohamed'),
  ('9173363915', '0125', 'Ahmed Abdellahi Mohamed khairat'),
  ('9951802883', '0126', 'Mohamed Mohamed Lemine Talebna'),
  ('3801045881', '0127', 'Mohamed Lemine Mohamed El Bechir'),
  ('4207819746', '0128', 'Aboubekrine Teiss'),
  ('7351703721', '0129', 'Lemroua Yarba Lekhdim'),
  ('4817883107', '0130', 'Mohamed Mamoud Salem Amar'),
  ('6105905561', '0131', 'Abdel vetah Med El Moustapha Amar'),
  ('7636759367', '0132', 'Bamba Alwa Savra'),
  ('2463711828', '0133', 'Amin Najeh Najeh'),
  ('9792504730', '0134', 'Mohamed Mahmoud Mohamed Noumane'),
  ('4278730917', '0135', 'Mohamed Mahmoud Habiboullah Abdou'),
  ('2257146351', '0136', 'Abdel Haye Mounah Sidi Oumar'),
  ('0679479860', '0137', 'Zeinel Abidine Elhacen'),
  ('7602602757', '0138', 'Ahmed ould Yeslem Ould Mah moud'),
  ('6066698161', '0139', 'Aziz Taleb Ahmed Khayar'),
  ('0577823278', '0140', 'Mohamed Lemine Nahi Salhi'),
  ('6540526574', '0141', 'Mahfoudh Saghiri Sid Ahmed'),
  ('8884695310', '0142', 'Mohamed El Moctar Ahmed Limam'),
  ('5801295006', '0143', 'Mohamed Mahmoud Mohamed Salem Mohamed T’Feil'),
  ('2743344301', '0144', 'Mohamed Limam Bourdid'),
  ('7975894740', '0145', 'Mohamed Mohamed khouna Taleb Hama'),
  ('1483587356', '0146', 'Mohamed Mohamed Lemin Tijani'),
  ('4976338815', '0147', 'Cheikh Abdallahi Cheikh Baye El Moustapha'),
  ('9956950479', '0148', 'Oumama Ahmed Bezeid Nounou'),
  ('0083470344', '0149', 'Mohamed El Moctar Ahmed Limam Hebeih'),
  ('9994878934', '0150', 'Moustapha Gaye'),
  ('2792495559', '0151', 'Abderahmane Jedna Elbechir'),
  ('3534993893', '0152', 'Cheikh Tijani Mohamedou Ndiemdi'),
  ('4339964980', '0153', 'Abderrahmane Mohamed Abdel lahi'),
  ('9636397295', '0154', 'Mohamed Mahmoud Marakchy Essemane'),
  ('3481828059', '0155', 'Yahye Med Ahmed Leihe'),
  ('3739888351', '0156', 'Ahmed Mahmoud Mohamed Salem Eymane'),
  ('2500614023', '0157', 'Nada Cheikh Saadbouh'),
  ('9766847454', '0158', 'Hademine Ahmed Vall Khyar'),
  ('2342144444', '0159', 'Ahmed Salem Mohamed Abdoul lahi'),
  ('3782001386', '0160', 'El Moctar Hamidoun El Ghazaly'),
  ('8678327131', '0161', 'Mohamed Ely Salem Mohamed El-Hassen'),
  ('5224533491', '0162', 'Oumar Demba Sow'),
  ('0550309131', '0163', 'Cheikhna Hadi'),
  ('4627699087', '0164', 'Barikalla Emane El Khalesse'),
  ('4874566221', '0165', 'M’hamed El Hadramy Ducros'),
  ('5032167844', '0166', 'Mohamed Lemine Brahim Ebah'),
  ('7782449778', '0167', 'Cheikh Ahmed Ely Nebache'),
  ('0013862853', '0168', 'Sidne El Khalil Mohamed Saleh'),
  ('3726815855', '0169', 'Moussab Ahmedou Khairy'),
  ('2364897249', '0170', 'Fatimetou Hademine'),
  ('4926275078', '0171', 'Sidi Mohamed Cheikhna'),
  ('9592416622', '0172', 'Abdel Elhadi Menih'),
  ('8298210321', '0173', 'Ahmed Mbareck Ahmed Mah moud'),
  ('5792226961', '0174', 'Sidi Mohamed Ahmed Habib'),
  ('3660864391', '0175', 'Mohamed Brahim Cheikh El Hassene'),
  ('6160370964', '0176', 'Fatimetou Zahra Abdallahi Eba'),
  ('342861148', '0177', 'Mohamed Sidi Deda'),
  ('324272359', '0178', 'Mohamed H’meime L’Keihel'),
  ('8250655877', '0179', 'Yacoub Mohamed Ahid Maham'),
  ('5054768165', '0180', 'Lemine Babe Ahmed El Bekaye'),
  ('1188196069', '0181', 'Mahfoudh Hamadi El Bekaye'),
  ('4483483173', '0182', 'Cheikh Brahim Mohamed Cheikh Abdallahi'),
  ('1103181971', '0183', 'Hamza Ahmedou El Moctar'),
  ('7486972549', '0184', 'Mohamed Abdarrahmane Emir'),
  ('5398920770', '0185', 'Mahfoudh Moulaye Sidi Salem'),
  ('4852838803', '0186', 'MOHAMED EL MOUSTAPHA LA RABASS SENHOURI'),
  ('487868833', '0187', 'Ebbah Mohamed Abdallahi Moha med Mahmoud'),
  ('4768618650', '0188', 'M’rabih Rabou Chbihenna Mohamed Sidina'),
  ('9187843202', '0189', 'Zeini Mohamedou Abass'),
  ('5280380174', '0190', 'Abdallah Mohamedou Abdallahi Salem'),
  ('4603497684', '0191', 'Sidi Mohamed Ahmed Mohamed Said'),
  ('4868061789', '0192', 'Cheikh Mohameden Terrouzi'),
  ('0384387430', '0193', 'Mohamed Mohamed Aly Eleyatt'),
  ('3147120963', '0194', 'Mohamed Isselmou Meinouh'),
  ('3956070990', '0195', 'Alioune Ahmed Bacar'),
  ('4697578566', '0196', 'Mohamed Lemine Cheikh Abdal lah Atigh'),
  ('5116885316', '0197', 'Mohamed Mahmoud El Hacen'),
  ('5849539469', '0198', 'Moulaye Abdarahmane Sidi Moha med Mahmoud Cherif'),
  ('9167696108', '0199', 'EL Hadrami Mohamed M’bareck Elboukhary'),
  ('2018303348', '0200', 'El Hacen Mohamed Mahmoud Beddy'),
  ('1906390277', '0201', 'Mohamed Salem Sidi Mohamed Taher Dellahi'),
  ('3451889628', '0202', 'Hamoud Mohamed Oumar'),
  ('0466355631', '0203', 'Moussa Sid El Moctar Waled'),
  ('5077115510', '0204', 'Lativa Abdellahi Salem Mahand'),
  ('1347495289', '0205', 'Abdellahi Ivekou Nahi'),
  ('1322443196', '0206', 'El Moustapha El Haj Maham'),
  ('6033821369', '0207', 'Betoul Sidiya'),
  ('5209969426', '0208', 'Ahmed Souleiman El haiba'),
  ('43011030538', '0209', 'Mohameden Habibou Llah Cheikh Dahy'),
  ('3221943271', '0210', 'Ahmed El Moctar Sidi Brahim'),
  ('1844461015', '0211', 'Moulaye Zein Dhehbi Javaar'),
  ('0597418636', '0212', 'M’Ghailly El Moustapha Abd Dayem'),
  ('9158313007', '0213', 'Moulaye Ely El Hachmi Moulaye Abdellah'),
  ('230555033', '0214', 'Hamdi Moulaye Sidi Salem'),
  ('7633396086', '0215', 'Mohamedou Cheikh'),
  ('8807821840', '0216', 'Seyid Mohamed Lemine Vall'),
  ('0144490425', '0217', 'Mohamed Lemrabott Limam'),
  ('7124231543', '0218', 'Fatimata Abdoul Sow'),
  ('5090297325', '0219', 'Cheikh Mohamed Lemine Sidi'),
  ('5188073325', '0220', 'Mohamed Abdelmejid Bouh'),
  ('3993238189', '0221', 'Mohamed Salem Sidi Badi'),
  ('9856932130', '0222', 'Cherif Eide Yahifdhou'),
  ('6294858942', '0223', 'Mohamed Moussa Dieye'),
  ('8078476124', '0224', 'Zeinebou Saleck Mohamed Vall'),
  ('3333960617', '0225', 'Lemrabett Mohamed Mahmoud'),
  ('8986701577', '0226', 'Mohamed Abdallahi Ague'),
  ('1513020454', '0227', 'Ahmed Ahmedou'),
  ('5511983582', '0228', 'Ahmed Mostapha Abdou'),
  ('0058295255', '0229', 'El hadrami Mohamed Jdey'),
  ('1822436195', '0230', 'Mohamed Lemine Aghrabatt'),
  ('5471852548', '0231', 'Aicha Haina Bousseif')

ON CONFLICT (nni) DO UPDATE
  SET matricule = EXCLUDED.matricule,
      full_name = EXCLUDED.full_name;

-- ---------------------------------------------------------------------------
-- 4. Réconciliation des profils existants
-- ---------------------------------------------------------------------------

-- Le trigger est retiré le temps de la réconciliation, puis recréé en 5.
DROP TRIGGER IF EXISTS trg_assign_matricule ON profiles;

-- 4.a  On libère tout matricule détenu à tort :
--      - matricule réservé porté par un profil dont le NNI ne correspond pas ;
--      - profil dont le NNI est réservé mais qui porte un autre matricule.
UPDATE profiles p
SET matricule = NULL
WHERE p.matricule IS NOT NULL
  AND (
    EXISTS (
      SELECT 1 FROM reserved_matricules r
      WHERE r.matricule = p.matricule
        AND r.nni IS DISTINCT FROM normalize_nni(p.nni)
    )
    OR EXISTS (
      SELECT 1 FROM reserved_matricules r
      WHERE r.nni = normalize_nni(p.nni)
        AND r.matricule IS DISTINCT FROM p.matricule
    )
  );

-- 4.b  Chaque profil dont le NNI est réservé reçoit SON matricule.
UPDATE profiles p
SET matricule = r.matricule
FROM reserved_matricules r
WHERE r.nni = normalize_nni(p.nni)
  AND p.matricule IS DISTINCT FROM r.matricule;

-- 4.c  Les profils restants reçoivent le plus petit numéro libre,
--      c'est-à-dire ni réservé, ni déjà attribué.
WITH libres AS (
  SELECT LPAD(g::text, 4, '0') AS m,
         ROW_NUMBER() OVER (ORDER BY g) AS rn
  FROM generate_series(1, 9999) AS g
  WHERE NOT EXISTS (SELECT 1 FROM reserved_matricules r WHERE r.matricule = LPAD(g::text, 4, '0'))
    AND NOT EXISTS (SELECT 1 FROM profiles pr WHERE pr.matricule = LPAD(g::text, 4, '0'))
),
manquants AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM profiles
  WHERE matricule IS NULL
)
UPDATE profiles p
SET matricule = libres.m
FROM manquants
JOIN libres ON libres.rn = manquants.rn
WHERE p.id = manquants.id;

-- 4.d  La séquence repart au-delà de tout ce qui est réservé ou attribué.
SELECT setval(
  'profiles_matricule_seq',
  GREATEST(
    COALESCE((SELECT MAX(matricule::int) FROM profiles), 0),
    COALESCE((SELECT MAX(matricule::int) FROM reserved_matricules), 0)
  ) + 1,
  false
);

-- ---------------------------------------------------------------------------
-- 5. Attribution automatique (inscription et correction de NNI)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION next_free_matricule()
RETURNS CHAR(4)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  candidat CHAR(4);
BEGIN
  LOOP
    candidat := LPAD(nextval('profiles_matricule_seq')::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM reserved_matricules r WHERE r.matricule = candidat)
          AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.matricule = candidat);
  END LOOP;
  RETURN candidat;
END;
$fn$;

CREATE OR REPLACE FUNCTION assign_matricule()
RETURNS TRIGGER AS $fn$
DECLARE
  reserve CHAR(4);
  proprio TEXT;
BEGIN
  SELECT r.matricule INTO reserve
  FROM reserved_matricules r
  WHERE r.nni = normalize_nni(NEW.nni);

  IF TG_OP = 'UPDATE' THEN
    -- Ni le NNI ni le matricule n'ont bougé : rien à faire.
    IF normalize_nni(NEW.nni) IS NOT DISTINCT FROM normalize_nni(OLD.nni)
       AND NEW.matricule IS NOT DISTINCT FROM OLD.matricule THEN
      RETURN NEW;
    END IF;

    -- NNI corrigé : l'ancien matricule réservé ne lui appartient plus.
    IF NEW.matricule IS NOT NULL
       AND EXISTS (SELECT 1 FROM reserved_matricules r
                   WHERE r.matricule = NEW.matricule
                     AND r.nni IS DISTINCT FROM normalize_nni(NEW.nni)) THEN
      NEW.matricule := NULL;
    END IF;
  END IF;

  -- Le NNI figure sur un badge déjà imprimé : on lui rend son numéro.
  IF reserve IS NOT NULL AND NEW.matricule IS DISTINCT FROM reserve THEN
    IF EXISTS (SELECT 1 FROM profiles p
               WHERE p.matricule = reserve AND p.id IS DISTINCT FROM NEW.id) THEN
      RAISE EXCEPTION 'Le matricule reserve % (NNI %) est deja porte par un autre profil',
        reserve, normalize_nni(NEW.nni);
    END IF;
    NEW.matricule := reserve;
    RETURN NEW;
  END IF;

  IF NEW.matricule IS NULL THEN
    NEW.matricule := next_free_matricule();
    RETURN NEW;
  END IF;

  -- Garde-fou : un matricule réservé n'est jamais attribué à un autre NNI.
  SELECT r.nni INTO proprio
  FROM reserved_matricules r
  WHERE r.matricule = NEW.matricule;

  IF proprio IS NOT NULL AND proprio IS DISTINCT FROM normalize_nni(NEW.nni) THEN
    RAISE EXCEPTION 'Le matricule % est reserve au NNI % et ne peut pas etre attribue',
      NEW.matricule, proprio;
  END IF;

  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_assign_matricule ON profiles;
CREATE TRIGGER trg_assign_matricule
  BEFORE INSERT OR UPDATE OF nni, matricule ON profiles
  FOR EACH ROW EXECUTE FUNCTION assign_matricule();

-- ---------------------------------------------------------------------------
-- 6. Contrôle : matricules réservés encore vacants
-- ---------------------------------------------------------------------------
-- SELECT r.matricule, r.nni, r.full_name
-- FROM reserved_matricules r
-- LEFT JOIN profiles p ON normalize_nni(p.nni) = r.nni
-- WHERE p.id IS NULL
-- ORDER BY r.matricule;
