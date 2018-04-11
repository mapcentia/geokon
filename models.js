/**
 * Created by mh on 10/4/17.
 */
module.exports = {
    Companies: {
        alias: "Virksomheder",
        seqNoType: "virk",
        color: "#ffb900",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

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
        color: "#298242",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Id"

            }, {
                key: "Name",
                alias: "Landbrugsnavn"

            }, {
                key: "Status",
                alias: "Status"

            }, {
                key: "MainActivity",
                alias: "Hovedaktivitet"

            }, {
                key: "EstablishDate",
                alias: "Etableret"

            }, {
                key: "LastInspectionDate",
                alias: "Tilsyn"

            }, {
                key: "LivestockUnitsPermitted",
                alias: "Dyreenheder"

            }, {
                key: "LivestockPermissionDate",
                alias: "Godk"

            }, {
                key: "OfficerId",
                alias: "Sagsbehandler"

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
        color: "#fb9a99",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Id"

            }, {
                key: "Name",
                alias: "Landbrugsnavn"

            }, {
                key: "StorageSysType",
                alias: "Beholdertype"

            }, {
                key: "Volume",
                alias: "Volumen m3"

            }, {
                key: "CoverType",
                alias: "Overdækning"

            }, {
                key: "BuildingDate",
                alias: "Byggedato"

            }, {
                key: "OutOfUseDate",
                alias: "Taget ud af drift"

            }, {
                key: "LastControlDate",
                alias: "Seneste kontrol"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    /*ContaminatedLands: {
        alias: "Jordforureningslokalitet",
        seqNoType: "indu",
        color: "#d95f0e",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Id"

            }, {
                key: "Name",
                alias: "Lokalitetsnavn"

            }, {
                key: "StatusName",
                alias: "Status"

            }, {
                key: "EnforceCount",
                alias: "Antal Håndhævelser"

            }, {
                key: "LastEnforceTypeName",
                alias: "Håndhævelsestype"

            }, {
                key: "LastEnforceDate",
                alias: "Sidste håndhævelsesdato"

            }, {
                key: "LastEnforceStatusName",
                alias: "Status på sidste håndhævelse"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },*/

    OpenCountries: {
        alias: "Åbent Land lokalitet",
        seqNoType: "open",
        color: "#00747a",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Id"

            }, {
                key: "Name",
                alias: "Lok navn"

            }, {
                key: "WasteWaterPurification",
                alias: "Rensning af spildevand"

            }, {
                key: "PlannedAction",
                alias: "Planlagt Indsats"

            }, {
                key: "UseType",
                alias: "Brugstype"

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
        color: "#f781bf",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Id"

            }, {
                key: "Name",
                alias: "Lok navn"

            }, {
                key: "Status",
                alias: "Status"

            }, {
                key: "TankType",
                alias: "Tanktype"

            }, {
                key: "EstablishedYear",
                alias: "Etableringsår"

            }, {
                key: "Volume",
                alias: "Volumen Liter"

            }, {
                key: "ChamberCount",
                alias: "Antal rum"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    },

    OpenCountryPurifications: {
        alias: "Rensningsanlæg i det åbne land",
        color: "#a6cee3",
        seqNoType: "ocpur",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Id"

            }, {
                key: "CurrentPurification",
                alias: "Rensning"

            }, {
                key: "Recipient",
                alias: "Recipient"

            }, {
                key: "Dimension",
                alias: "Dimensionering  PE"

            }, {
                key: "PercolationArea",
                alias: "Nedsivningsareal m2"

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
        color: "#002557",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "LokNr"

            }, {
                key: "Name",
                alias: "Navn"

            }, {
                key: "Active",
                alias: "Aktivt"

            }, {
                key: "PlantType",
                alias: "Anlægstype"

            }, {
                key: "SecondaryPlantType",
                alias: "Bi-anlægstype"

            }, {
                key: "LastSampleDate",
                alias: "Seneste prøve"

            }, {
                key: "CatchPermissionPermDate",
                alias: "Indvindingstilladelse - start"

            }, {
                key: "CatchPermissionExpireDate",
                alias: "Indvindingstilladelse - slut"

            }, {
                key: "CatchPermissionAmountYear",
                alias: "IndvindIngstilladelse M3"

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
        color: "#fb9a99",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Lok nr."

            }, {
                key: "Name",
                alias: "Lok navn"

            }, {
                key: "Content",
                alias: "Indhold"

            }, {
                key: "Volume",
                alias: "Volumen Liter"

            }, {
                key: "VolumeApprox",
                alias: "Anslået volumen Liter"

            },
            {
                key: "Location",
                alias: "Placering"

            },
            {
                key: "EstablishedApprox",
                alias: "Etableret"

            },
            {
                key: "RemovedApprox",
                alias: "Fjernet"

            },
            {
                key: "CoveredUpApprox",
                alias: "Afblændet"

            },
            {
                key: "LastInspectionDate",
                alias: "(Sidste inspektion"

            },
            {
                key: "DensityTestDate",
                alias: "Seneste tæthedsprøve"

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
        color: "#ff7f00",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Lok nr."

            },
            {
                key: "Name",
                alias: "Lok navn"

            },
            {
                key: "SepType",
                alias: "Udskillertype"

            },
            {
                key: "Volume",
                alias: "Volumen m3"

            },
            {
                key: "ApproveDate",
                alias: "Godkendt"

            },
            {
                key: "DeregistrationDate",
                alias: "Afmelding"

            },
            {
                key: "DismantleDate",
                alias: "Sløjfning"

            },
            {
                key: "DensityTestDate",
                alias: "Tæthedsprøvning"

            },
            {
                key: "LastDrainageDate",
                alias: "Tømning"

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
        color: "#cab2d6",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Lok nr."

            }, {
                key: "Name",
                alias: "Lok navn"

            },
            {
                key: "Volume",
                alias: "Volumen m3"

            },
            {
                key: "ApprovalDate",
                alias: "Godkendt"

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
        color: "#1f78b4",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Lok nr."

            },
            {
                key: "Name",
                alias: "Lok navn"

            },
            {
                key: "GeothermType",
                alias: "Anlægstype"

            },
            {
                key: "TotalLiquidAmount",
                alias: "Total mængde væske i anlæg, Liter"

            },
            {
                key: "ApprovalDate",
                alias: "Godkendt"

            },
            {
                key: "EstablishedDate",
                alias: "Etableret"

            },
            {
                key: "RemovedDate",
                alias: "Fjernet"

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
        color: "#7f542a",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            },
            {
                key: "SeqNoType",
                alias: "SeqNoType"

            },
            {
                key: "Id",
                alias: "Anlægs Id"

            },
            {
                key: "Name",
                alias: "Anlægsnavn"

            },
            {
                key: "BoreHoleId",
                alias: "Boringsnr."

            },
            {
                key: "Use",
                alias: "Anvendelse"

            },
            {
                key: "LastGroundWaterLevel",
                alias: "Sidste pejling GVS kote"

            },
            {
                key: "Depth",
                alias: "Dybde m u.t."

            },
            {
                key: "GroundLevel",
                alias: "terrænkote"

            },
            {
                key: "DismantleDate",
                alias: "Sløjfning"

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
        color: "#a60000",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Lok nr."

            },
            {
                key: "Name",
                alias: "Lok navn"

            },
            {
                key: "Status",
                alias: "Kortlægning"

            },
            {
                key: "StatusDate",
                alias: "Kortlægningsdato"

            },
            {
                key: "ActivityName",
                alias: "Aktivitetsnavn"

            },
            {
                key: "ActivityType",
                alias: "Aktivitetstype"

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
        color: "#00a518",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Vandløbets Id"

            },
            {
                key: "Name",
                alias: "Vandløbets Navn"

            },
            {
                key: "StationName",
                alias: "Stationens navn"

            },
            {
                key: "StationType",
                alias: "Stationens type"

            },
            {
                key: "Active",
                alias: "Aktiv"

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
        color: "#66350f",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Lok nr."

            },
            {
                key: "Name",
                alias: "Lok navn"

            },
            {
                key: "InitialisationDate",
                alias: "Idriftssættelse"

            },
            {
                key: "Effect",
                alias: "Effekt kW"

            },
            {
                key: "HubHeight",
                alias: "Navhøjde m"

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
        color: "#872E91",
        fields: [
            {
                key: "SeqNo",
                alias: "SeqNo"

            }, {
                key: "SeqNoType",
                alias: "SeqNoType"

            }, {
                key: "Id",
                alias: "Lok nr."

            },
            {
                key: "Name",
                alias: "Lok navn"

            },
            {
                key: "CasefileName",
                alias: "CasefileName"

            },
            {
                key: "CasefileStatus",
                alias: "CasefileStatus"

            },
            {
                key: "ApplicandReceivedDate",
                alias: "Modtagelse"

            },
            {
                key: "AdequateDate",
                alias: "Fyldestgørende materiale modtaget"

            },
            {
                key: "Deadline",
                alias: "Afgørelse"

            },
            {
                key: "ShelvingDate",
                alias: "Henlæggelse"

            },
            {
                key: "EndDate",
                alias: "Afsluttet"

            },
            {
                key: "CaseClosed",
                alias: "Sag lukket"

            },
            {
                key: "GELink",
                alias: "GELink"

            }
        ]
    }
};