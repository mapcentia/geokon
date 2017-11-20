/**
 * Created by mh on 10/4/17.
 */
module.exports = {
    Companies: {
        alias: "Virksomheder",
        seqNoType: "virk",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Lok nr."

            }, {
                key: "Name",
                alias: "Virksomhedsnavn"

            }, {
                key: "Status",
                alias: "Status"

            }, {
                key: "MainActivity",
                alias: "Hovedaktivitet"

            }, {
                key: "SecondaryActivity",
                alias: "bi-ktivitet"

            }, {
                key: "EstablishDate",
                alias: "Etableret"

            }, {
                key: "LastInspectionDate",
                alias: "Tilsyn"

            }, {
                key: "EnvApprovalDate",
                alias: "Miljøgodk"

            }, {
                key: "OfficerId",
                alias: "Sagsbehandler"

            }, {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    Agricultures: {
        alias: "Landbrug",
        seqNoType: "agr",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    AgricultureStorages: {
        alias: "Gyllebeholdere",
        seqNoType: "agrsto",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    OpenCountries: {
        alias: "Åbent Land lokalitet",
        seqNoType: "open",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    OpenCountryTanks: {
        alias: "Spildevandstank i det åbne land",
        seqNoType: "octank",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    OpenCountryPurifications: {
        alias: "Rensningsanlæg i det åbne land",
        seqNoType: "ocpur",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    WaterCatchmentPlants: {
        alias: "Vandindvindingsanlæg",
        seqNoType: "water",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    Tanks: {
        alias: "Olie- og kemikalietanke",
        seqNoType: "tank",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    Separators: {
        alias: "Udskillere",
        seqNoType: "sep",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    SandTraps: {
        alias: "Sandfang",
        seqNoType: "sdtrap",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    GeothermalHeatSystems: {
        alias: "Jordvarmeanlæg",
        seqNoType: "heat",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    Borings: {
        alias: "Boringer",
        seqNoType: "boring",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            },
            {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    ContaminatedLandActivities: {
        alias: "Jordforureningsaktiviteter",
        seqNoType: "act",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    Stations: {
        alias: "Stationer/udløb - vandløb",
        seqNoType: "sta",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    Windmills: {
        alias: "Vindmøller",
        seqNoType: "wmill",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    BldCasefiles: {
        alias: "Byggesager",
        seqNoType: "bld",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "Id",
                alias: "Id"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    }
};