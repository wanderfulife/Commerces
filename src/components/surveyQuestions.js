export const questions = [
	{
		id: "Q1",
		text: "Adresse de l'établissement",
		freeText: true,
		freeTextPlaceholder: "Saisissez l'adresse complète",
		next: "Q2"
	},
	{
		id: "Q2",
		text: "Raison sociale de l'établissement",
		freeText: true,
		freeTextPlaceholder: "Saisissez la raison sociale",
		next: "Q3"
	},
	{
		id: "Q3",
		text: "Activité de l'établissement",
		options: [
			{ id: 1, text: "Cafés, hôtels, restaurants", next: "Q4" },
			{ id: 2, text: "Cinémas, musées, médiathèques, salles de sport et spectacle", next: "Q4" },
			{ id: 3, text: "Création artistique", next: "Q4" },
			{ id: 4, text: "Organisation touristique", next: "Q4" },
			{ id: 5, text: "Grand magasin spécialisé", next: "Q4" },
			{ id: 6, text: "Hypermarché", next: "Q4" },
			{ id: 7, text: "Supermarché", next: "Q4" },
			{ id: 8, text: "Commerce de gros", next: "Q4" },
			{ id: 9, text: "Blanchisserie, teinturerie", next: "Q4" },
			{ id: 10, text: "Boucherie, charcuterie, poissonnerie, traiteur", next: "Q4" },
			{ id: 11, text: "Boulangerie, pâtisserie", next: "Q4" },
			{ id: 12, text: "Commerce d'ameublement", next: "Q4" },
			{ id: 13, text: "Commerce de boissons, caviste", next: "Q4" },
			{ id: 14, text: "Commerce de vente à distance", next: "Q4" },
			{ id: 15, text: "Commerce d'équipements de beauté-hygiène", next: "Q4" },
			{ id: 16, text: "Commerce d'équipements de la maison", next: "Q4" },
			{ id: 17, text: "Commerce d'équipements de la personne", next: "Q4" },
			{ id: 18, text: "Commerce et réparation d'automobiles et de motocycles", next: "Q4" },
			{ id: 19, text: "Épicerie", next: "Q4" },
			{ id: 20, text: "Fromagerie, crèmerie", next: "Q4" },
			{ id: 21, text: "Librairie papeterie", next: "Q4" },
			{ id: 22, text: "Location de matériels et d'équipements", next: "Q4" },
			{ id: 23, text: "Pharmacie", next: "Q4" },
			{ id: 24, text: "Quincaillerie", next: "Q4" },
			{ id: 25, text: "Réparation de biens domestiques et personnels", next: "Q4" },
			{ id: 26, text: "Supérette", next: "Q4" },
			{ id: 27, text: "Activité tertiaire et/ou administrative", next: "Q4" },
			{ id: 28, text: "Activité de transport de marchandises et de logistique", next: "Q4" },
			{ id: 29, text: "Autre", next: "Q4" }
		]
	},
	{
		id: "Q4",
		text: "Nombre d'employés au moment de l'enquête",
		freeText: true,
		freeTextPlaceholder: "Nombre d'employés",
		validation: "numeric",
		next: "Q5"
	},
	{
		id: "Q5",
		text: "Disposez-vous d'une terrasse ou d'une contre terrasse ?",
		options: [
			{ id: 1, text: "Oui", next: "Q6" },
			{ id: 2, text: "Non", next: "Q6" },
			{ id: 3, text: "Je ne sais pas", next: "Q6" }
		]
	},
	{
		id: "Q6",
		text: "Quelle est la surface de vente de votre établissement ? (en mètres carrés)",
		freeText: true,
		freeTextPlaceholder: "Surface en m²",
		validation: "numeric",
		next: "Q7"
	},
	{
		id: "Q7",
		text: "Quelle est la surface de stockage de votre établissement ? (en mètres carrés)",
		freeText: true,
		freeTextPlaceholder: "Surface en m²",
		validation: "numeric",
		next: "Q8"
	},
	{
		id: "Q8",
		text: "Disposez-vous d'une surface permettant l'accueil de véhicules dans l'enceinte de votre établissement ?",
		options: [
			{ id: 1, text: "Oui", next: "Q9" },
			{ id: 2, text: "Non", next: "Q9" },
			{ id: 3, text: "Je ne sais pas", next: "Q9" }
		]
	},
	{
		id: "Q9",
		text: "Quels jours ont principalement lieu vos approvisionnements ?",
		multipleChoice: true,
		options: [
			{ id: 1, text: "Lundi", next: "Q10" },
			{ id: 2, text: "Mardi", next: "Q10" },
			{ id: 3, text: "Mercredi", next: "Q10" },
			{ id: 4, text: "Jeudi", next: "Q10" },
			{ id: 5, text: "Vendredi", next: "Q10" },
			{ id: 6, text: "Samedi", next: "Q10" },
			{ id: 7, text: "Dimanche", next: "Q10" }
		]
	},
	{
		id: "Q10",
		text: "À quelle heure ont principalement lieu vos approvisionnements ?",
		freeText: true,
		freeTextPlaceholder: "Heure (ex: 08:30)",
		validation: "time",
		next: "Q11"
	},
	{
		id: "Q11",
		text: "Pour vos approvisionnements, vous arrive-t-il d'aller chercher vous-même vos marchandises ?",
		options: [
			{ id: 1, text: "Oui", next: "Q12" },
			{ id: 2, text: "Non", next: "Q16" },
			{ id: 3, text: "Je ne sais pas", next: "Q16" }
		]
	},
	{
		id: "Q12",
		text: "Combien de fois par semaine ?",
		freeText: true,
		freeTextPlaceholder: "Nombre de fois par semaine",
		validation: "numeric",
		next: "Q13"
	},
	{
		id: "Q13",
		text: "Quel véhicule utilisez-vous pour cela ?",
		options: [
			{ id: 1, text: "Cyclo-cargo", next: "Q14" },
			{ id: 2, text: "Véhicule particulier", next: "Q14" },
			{ id: 3, text: "Véhicule utilitaire léger (fourgonnette ou camionnette)", next: "Q14" },
			{ id: 4, text: "Camion (porteur ou semi-remorque)", next: "Q14" }
		]
	},
	{
		id: "Q14",
		text: "Où stationnez-vous votre véhicule pour décharger vos marchandises ?",
		options: [
			{ id: 1, text: "Dans l'enceinte de l'établissement", next: "Q15" },
			{ id: 2, text: "Sur l'aire de livraison la plus proche", next: "Q15" },
			{ id: 3, text: "Sur une place de stationnement vp", next: "Q15" },
			{ id: 4, text: "En double-file", next: "Q15" },
			{ id: 5, text: "Sur le trottoir", next: "Q15" }
		]
	},
	{
		id: "Q15",
		text: "Quel est le temps moyen de déchargement de vos livraisons (en minutes) ?",
		freeText: true,
		freeTextPlaceholder: "Temps en minutes",
		validation: "numeric",
		next: "Q16"
	},
	{
		id: "Q16",
		text: "Un/des fournisseurs vous livrent-ils ?",
		options: [
			{ id: 1, text: "Oui", next: "Q17" },
			{ id: 2, text: "Non", next: "Q21" },
			{ id: 3, text: "Je ne sais pas", next: "Q21" }
		]
	},
	{
		id: "Q17",
		text: "Combien de fois par semaine ?",
		freeText: true,
		freeTextPlaceholder: "Nombre de fois par semaine",
		validation: "numeric",
		next: "Q18"
	},
	{
		id: "Q18",
		text: "Quel type de véhicule utilisent-ils principalement ?",
		options: [
			{ id: 1, text: "Je ne sais pas", next: "Q19" },
			{ id: 2, text: "Cyclo-cargo", next: "Q19" },
			{ id: 3, text: "Véhicule utilitaire léger (fourgonnette ou camionnette)", next: "Q19" },
			{ id: 4, text: "Camion (porteur ou semi-remorque)", next: "Q19" }
		]
	},
	{
		id: "Q19",
		text: "Où stationnent-ils généralement ?",
		options: [
			{ id: 1, text: "Je ne sais pas", next: "Q20" },
			{ id: 2, text: "Dans l'enceinte de l'établissement", next: "Q20" },
			{ id: 3, text: "Sur l'aire de livraison la plus proche", next: "Q20" },
			{ id: 4, text: "Sur une place de stationnement vp", next: "Q20" },
			{ id: 5, text: "En double-file", next: "Q20" },
			{ id: 6, text: "Sur le trottoir", next: "Q20" }
		]
	},
	{
		id: "Q20",
		text: "Quelle est la raison sociale de votre principal fournisseur ?",
		freeText: true,
		freeTextPlaceholder: "Raison sociale du fournisseur",
		next: "Q21"
	},
	{
		id: "Q21",
		text: "Un/des transporteur(s) vous livrent ?",
		options: [
			{ id: 1, text: "Oui", next: "Q22" },
			{ id: 2, text: "Non", next: "Q26" },
			{ id: 3, text: "Je ne sais pas", next: "Q26" }
		]
	},
	{
		id: "Q22",
		text: "Combien de fois par semaine ?",
		freeText: true,
		freeTextPlaceholder: "Nombre de fois par semaine",
		validation: "numeric",
		next: "Q23"
	},
	{
		id: "Q23",
		text: "Quel type de véhicule utilisent-ils principalement ?",
		options: [
			{ id: 1, text: "Je ne sais pas", next: "Q24" },
			{ id: 2, text: "Cyclo-cargo", next: "Q24" },
			{ id: 3, text: "Véhicule utilitaire léger (fourgonnette ou camionnette)", next: "Q24" },
			{ id: 4, text: "Camion (porteur ou semi-remorque)", next: "Q24" }
		]
	},
	{
		id: "Q24",
		text: "Où stationnent-ils généralement ?",
		options: [
			{ id: 1, text: "Je ne sais pas", next: "Q25" },
			{ id: 2, text: "Dans l'enceinte de l'établissement", next: "Q25" },
			{ id: 3, text: "Sur l'aire de livraison la plus proche", next: "Q25" },
			{ id: 4, text: "Sur une place de stationnement vp", next: "Q25" },
			{ id: 5, text: "En double-file", next: "Q25" },
			{ id: 6, text: "Sur le trottoir", next: "Q25" }
		]
	},
	{
		id: "Q25",
		text: "Quelle est la raison sociale du principal transporteur qui vous livre ?",
		freeText: true,
		freeTextPlaceholder: "Raison sociale du transporteur",
		next: "Q26"
	},
	{
		id: "Q26",
		text: "Proposez-vous des livraisons à vos clients ?",
		options: [
			{ id: 1, text: "Oui", next: "Q27" },
			{ id: 2, text: "Non", next: "Q29" },
			{ id: 3, text: "Je ne sais pas", next: "Q29" }
		]
	},
	{
		id: "Q27",
		text: "Combien d'expéditions réalisez-vous en moyenne chaque semaine ?",
		freeText: true,
		freeTextPlaceholder: "Nombre d'expéditions par semaine",
		validation: "numeric",
		next: "Q28"
	},
	{
		id: "Q28",
		text: "Qui prend en charge le transport ?",
		options: [
			{ id: 1, text: "Vous-même", next: "Q29" },
			{ id: 2, text: "Un transporteur (par exemples La Poste, Chronopost, DHL, etc.)", next: "Q29" }
		]
	},
	{
		id: "Q29",
		text: "Y-a-t-il une ou plusieurs aires de livraison à proximité de votre établissement ?",
		options: [
			{ id: 1, text: "Oui", next: "Q30" },
			{ id: 2, text: "Non", next: "Q32" },
			{ id: 3, text: "Je ne sais pas", next: "Q32" }
		]
	},
	{
		id: "Q30",
		text: "Comment évaluez-vous la disponibilité des aires de livraison sur votre secteur ?",
		options: [
			{ id: 1, text: "1 - Très mauvaise", next: "Q31" },
			{ id: 2, text: "2 - Mauvaise", next: "Q31" },
			{ id: 3, text: "3 - Moyenne", next: "Q31" },
			{ id: 4, text: "4 - Bonne", next: "Q31" },
			{ id: 5, text: "5 - Très bonne", next: "Q31" }
		]
	},
	{
		id: "Q31",
		text: "Comment évaluez-vous le contrôle des aires de livraison (par la police ou les services municipaux) ?",
		options: [
			{ id: 1, text: "1 - Très mauvaise", next: "Q32" },
			{ id: 2, text: "2 - Mauvaise", next: "Q32" },
			{ id: 3, text: "3 - Moyenne", next: "Q32" },
			{ id: 4, text: "4 - Bonne", next: "Q32" },
			{ id: 5, text: "5 - Très bonne", next: "Q32" }
		]
	},
	{
		id: "Q32",
		text: "Auriez-vous des souhaits particuliers ou des propositions concernant l'amélioration de la gestion des livraisons dans le secteur ?",
		freeText: true,
		freeTextPlaceholder: "Vos commentaires et suggestions...",
		next: "end"
	}
];