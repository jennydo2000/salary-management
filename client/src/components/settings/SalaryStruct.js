import {
    AppBar,
    Box, Button,
    Grid,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import {useContext, useEffect, useState} from "react";
import request from "../../utils/request";
import context from "../../utils/context";

export const defaultStructs = {
    main: {
        sheetIndex: 0,
        salary: "L9",
        name: "B",
        code: "C",
        newLevel: "D",
        coefficientMain: "E",
        coefficientArea: "F",
        coefficientPosition: "G",
        coefficientOverYear: "H",
        coefficientJob: "I",
        coefficientTeach: "J",
        coefficientSum: "K",
        sum: "M",
        teachReward: "O",
        insuranceHealth: "P",
        insuranceSocial: "Q",
        insuranceUnemployment: "R",
        insuranceSum: "S",
        remain: "T",
    },
    add: {
        sheetIndex: 1,
        name: ["B", "C"],
        coefficientMain: "D",
        coefficientOverYear: "E",
        coefficientArea: "F",
        coefficientPosition: "G",
        coefficientSum: "H",
        sum: "I",
        sum80: "J",
        sum40: "K",
        remain20: "L",
        subDayOff: "M",
        remain: "N",
    },
    fee: {
        sheetIndex: 2,
        name: ["B", "C"],
        coefficientGovernment: "G",
        coefficientParty: "I",
        coefficientSum: "J",
        sum: "K",
        specialJob: "L",
        addSum: "M",
        subDayOff: "N",
        remain: "O",
    },
    teach: {
        tableName: "A3",
        name: "B",
        lessons: "C",
        exchangedLessons: "D",
        superviseExam: "E",
        subTeach: "H",
        subResearch: "I",
        subSum: "J",
        lessonSum: "K",
        sum: "L",
    },
    guide: {
        tableName: "A5",
        name: "B",
        mission: "C",
        studentCount: "D",
        lessonCount: "E",
        price: "F",
        sum: "G",
    },
    welfare: {
        tableName: "A5",
        name: ["B", "C"],
        sum: "E",
    },
    other: {
        tableName: "A5",
        name: ["B", "C"],
        sum: "E",
    }
};

function SalaryStruct() {
    const {isLoading, startLoading, stopLoading, success, error} = useContext(context);
    const [structs, setStructs] = useState(null);
    const [salaryType, setSalaryType] = useState("main");

    useEffect(() => {
        getSalaryStructs().then(data => setStructs(data)).catch(err => setStructs(defaultStructs));
    }, []);

    const getSalaryStructs = () => {
        return new Promise(((resolve, reject) => {
            startLoading();
            request.get("/salaries/getStructs").then(res => {
                stopLoading();
                resolve(res.data);
            }).catch(err => {
                stopLoading();
                error("T???i c???u tr??c l????ng l???i");
                reject(err);
            })
        }));
    }

    const handleChangeSalaryType = (type) => {
        setSalaryType(type);
    }

    const handleSaveSalaryStruct = (e) => {
        e.preventDefault();

        const newStructs = {
            main: {
                sheetIndex: e.target.mainSheetIndex.value,
                salary: e.target.mainSalary.value,
                name: e.target.mainName.value.split(","),
                code: e.target.code.value,
                newLevel: e.target.newLevel.value,
                coefficientMain: e.target.mainCoefficientMain.value,
                coefficientArea: e.target.mainCoefficientArea.value,
                coefficientPosition: e.target.mainCoefficientPosition.value,
                coefficientOverYear: e.target.mainCoefficientOverYear.value,
                coefficientJob: e.target.coefficientJob.value,
                coefficientTeach: e.target.coefficientTeach.value,
                coefficientSum: e.target.mainCoefficientSum.value,
                sum: e.target.mainSum.value,
                teachReward: e.target.teachReward.value,
                insuranceHealth: e.target.insuranceHealth.value,
                insuranceSocial: e.target.insuranceSocial.value,
                insuranceUnemployment: e.target.insuranceUnemployment.value,
                insuranceSum: e.target.insuranceSum.value,
                remain: e.target.mainRemain.value,
            },
            add: {
                sheetIndex: e.target.addSheetIndex.value,
                name: e.target.addName.value.split(","),
                coefficientMain: e.target.addCoefficientMain.value,
                coefficientOverYear: e.target.addCoefficientOverYear.value,
                coefficientArea: e.target.addCoefficientArea.value,
                coefficientPosition: e.target.addCoefficientPosition.value,
                coefficientSum: e.target.addCoefficientSum.value,
                sum: e.target.addSum.value,
                sum80: e.target.addSum80.value,
                sum40: e.target.addSum40.value,
                remain20: e.target.addRemain20.value,
                subDayOff: e.target.addSubDayOff.value,
                remain: e.target.addRemain.value,
            },
            fee: {
                sheetIndex: e.target.feeSheetIndex.value,
                name: e.target.feeName.value.split(","),
                coefficientGovernment: e.target.coefficientGovernment.value,
                coefficientParty: e.target.coefficientParty.value,
                coefficientSum: e.target.feeCoefficientSum.value,
                sum: e.target.feeSum.value,
                specialJob: e.target.specialJob.value,
                addSum: e.target.feeAddSum.value,
                subDayOff: e.target.feeSubDayOff.value,
                remain: e.target.feeRemain.value,
            },
            teach: {
                tableName: e.target.teachTableName.value,
                name: e.target.teachName.value.split(","),
                lessons: e.target.lessons.value,
                exchangedLessons: e.target.exchangedLessons.value,
                superviseExam: e.target.superviseExam.value,
                subTeach: e.target.subTeach.value,
                subResearch: e.target.subResearch.value,
                subSum: e.target.subSum.value,
                lessonSum: e.target.lessonSum.value,
                sum: e.target.teachSum.value,
            },
            guide: {
                tableName: e.target.guideTableName.value,
                name: e.target.guideName.value,
                mission: e.target.mission.value,
                studentCount: e.target.studentCount.value,
                lessonCount: e.target.lessonCount.value,
                price: e.target.price.value,
                sum: e.target.guideSum.value,
            },
            welfare: {
                tableName: e.target.welfareTableName.value,
                name: e.target.welfareName.value.split(","),
                sum: e.target.welfareSum.value,
            },
            other: {
                tableName: e.target.otherTableName.value,
                name: e.target.otherName.value.split(","),
                sum: e.target.otherSum.value,
            }
        }

        startLoading();
        request.post("/salaries/updateStructs", newStructs).then(data => {
            stopLoading();
            success("C???p nh???t th??nh c??ng");
        }).catch(err => {
            stopLoading();
            error("C???p nh???t l???i");
        })
    }

    return (
        <Paper
            sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                flexGrow: 1,
                overflowY: "auto",
            }}
            component="form"
            onSubmit={handleSaveSalaryStruct}
        >
            <AppBar position="static" sx={{mb: 2}}>
                <Tabs
                    value={salaryType}
                    onChange={(e, v) => handleChangeSalaryType(v)}
                    indicatorColor="secondary"
                    textColor="inherit"
                    centered
                >
                    {[
                        {label: "L????ng ch??nh", value: "main"},
                        {label: "L????ng t??ng th??m", value: "add"},
                        {label: "Qu???n l?? ph??", value: "fee"},
                        {label: "L????ng gi???ng d???y", value: "teach"},
                        {label: "????? ??n", value: "guide"},
                        {label: "Ph??c l???i", value: "welfare"},
                        {label: "C??c kho???n kh??c", value: "other"},
                    ].map((item, index) =>
                        <Tab key={index} label={item.label} value={item.value}/>
                    )}
                </Tabs>
            </AppBar>
            {structs ?
                <Grid container spacing={2} justifyContent="center" sx={{
                    flexGrow: 1,
                    height: 0,
                    overflowY: "auto",
                    border: 1,
                    borderRadius: 1,
                    borderColor: "grey.300",
                }}>
                    <Grid item xs={12} sm={6} md={4} lg={3} sx={{display: salaryType === "main" ? "block" : "none", flexDirection: "column", "& > :not(style)": {my: 1}}}>
                        <Typography variant="h4" textAlign="center"><b>L????ng ch??nh</b></Typography>
                        <TextField size="small" fullWidth name="mainSheetIndex" label="Th??? t??? sheet"
                                   defaultValue={structs.main.sheetIndex}/>
                        <TextField size="small" fullWidth name="mainSalary" label="L????ng c?? b???n"
                                   defaultValue={structs.main.salary}/>

                        <Typography textAlign="center"><b>C??c c???t</b></Typography>
                        <TextField size="small" fullWidth name="mainName" label="T??n"
                                   defaultValue={structs.main.name}/>
                        <TextField size="small" fullWidth name="code" label="M?? s??? ng???ch l????ng"
                                   defaultValue={structs.main.code}/>
                        <TextField size="small" fullWidth name="newLevel" label="B???c m???i"
                                   defaultValue={structs.main.newLevel}/>
                        <TextField size="small" fullWidth name="mainCoefficientMain" label="H??? s??? l????ng"
                                   defaultValue={structs.main.coefficientMain}/>
                        <TextField size="small" fullWidth name="mainCoefficientArea" label="Ph??? c???p khu v???c"
                                   defaultValue={structs.main.coefficientArea}/>
                        <TextField size="small" fullWidth name="mainCoefficientPosition" label="Ph??? c???p ch???c v???"
                                   defaultValue={structs.main.coefficientPosition}/>
                        <TextField size="small" fullWidth name="mainCoefficientOverYear"
                                   label="Ph??? c???p th??m ni??n VK"
                                   defaultValue={structs.main.coefficientOverYear}/>
                        <TextField size="small" fullWidth name="coefficientJob" label="Ph??? c???p TN theo cv"
                                   defaultValue={structs.main.coefficientJob}/>
                        <TextField size="small" fullWidth name="coefficientTeach"
                                   label="PC th??m ni??n nh?? gi??o"
                                   defaultValue={structs.main.coefficientTeach}/>
                        <TextField size="small" fullWidth name="mainCoefficientSum" label="C???ng h??? s???"
                                   defaultValue={structs.main.coefficientSum}/>
                        <TextField size="small" fullWidth name="mainSum"
                                   label="T???ng c???ng ti???n l????ng ???????c h?????ng"
                                   defaultValue={structs.main.sum}/>
                        <TextField size="small" fullWidth name="teachReward" label="??u ????i ?????ng l???p"
                                   defaultValue={structs.main.teachReward}/>
                        <TextField size="small" fullWidth name="insuranceHealth" label="BHYT"
                                   defaultValue={structs.main.insuranceHealth}/>
                        <TextField size="small" fullWidth name="insuranceSocial" label="BHXH"
                                   defaultValue={structs.main.insuranceSocial}/>
                        <TextField size="small" fullWidth name="insuranceUnemployment" label="BHTN"
                                   defaultValue={structs.main.insuranceUnemployment}/>
                        <TextField size="small" fullWidth name="insuranceSum" label="T???ng tr???"
                                   defaultValue={structs.main.insuranceSum}/>
                        <TextField size="small" fullWidth name="mainRemain" label="C??n nh???n"
                                   defaultValue={structs.main.remain}/>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3} sx={{display: salaryType === "add" ? "initial" : "none", "& > :not(style)": {my: 1}}}>
                        <Typography variant="h4" textAlign="center"><b>L????ng t??ng th??m</b></Typography>
                        <TextField size="small" fullWidth name="addSheetIndex" label="Th??? t??? sheet"
                                   defaultValue={structs.add.sheetIndex}/>
                        <TextField size="small" fullWidth name="addSalary" label="M???c chi tr???/1 h??? s???"
                                   defaultValue={structs.add.salary}/>

                        <Typography textAlign="center"><b>C??c c???t</b></Typography>
                        <TextField size="small" fullWidth name="addName" label="T??n"
                                   defaultValue={structs.add.name.toString()}/>
                        <TextField size="small" fullWidth name="addCoefficientMain" label="H??? s??? l????ng"
                                   defaultValue={structs.add.coefficientMain}/>
                        <TextField size="small" fullWidth name="addCoefficientOverYear"
                                   label="Ph??? c???p th??m ni??n VK"
                                   defaultValue={structs.add.coefficientOverYear}/>
                        <TextField size="small" fullWidth name="addCoefficientArea" label="Ph??? c???p khu v???c"
                                   defaultValue={structs.add.coefficientArea}/>
                        <TextField size="small" fullWidth name="addCoefficientPosition" label="Ph??? c???p ch???c v???"
                                   defaultValue={structs.add.coefficientPosition}/>
                        <TextField size="small" fullWidth name="addCoefficientSum" label="C???ng h??? s???"
                                   defaultValue={structs.add.coefficientSum}/>
                        <TextField size="small" fullWidth name="addSum" label="Th??nh ti???n"
                                   defaultValue={structs.add.sum}/>
                        <TextField size="small" fullWidth name="addSum80" label="80% ti???n l????ng ???????c nh???n"
                                   defaultValue={structs.add.sum80}/>
                        <TextField size="small" fullWidth name="addSum40" label="40% ti???n l????ng ???????c nh???n"
                                   defaultValue={structs.add.sum40}/>
                        <TextField size="small" fullWidth name="addRemain20" label="20% c??n l???i"
                                   defaultValue={structs.add.remain20}/>
                        <TextField size="small" fullWidth name="addSubDayOff" label="Tr??? ng??y ngh???"
                                   defaultValue={structs.add.subDayOff}/>
                        <TextField size="small" fullWidth name="addRemain" label="Th???c nh???n"
                                   defaultValue={structs.add.remain}/>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3} sx={{display: salaryType === "fee" ? "initial" : "none", "& > :not(style)": {my: 1}}}>
                        <Typography variant="h4" textAlign="center"><b>Qu???n l?? ph??</b></Typography>
                        <TextField size="small" fullWidth name="feeSheetIndex" label="Th??? t??? sheet"
                                   defaultValue={structs.fee.sheetIndex}/>
                        <TextField size="small" fullWidth name="feeSalary" label="M???c chi tr???/1 h??? s???"
                                   defaultValue={structs.fee.salary}/>

                        <Typography textAlign="center"><b>C??c c???t</b></Typography>
                        <TextField size="small" fullWidth name="feeName" label="T??n"
                                   defaultValue={structs.fee.name.toString()}/>
                        <TextField size="small" fullWidth name="coefficientGovernment"
                                   label="H??? s??? Ch???c v??? ch??nh quy???n"
                                   defaultValue={structs.fee.coefficientGovernment}/>
                        <TextField size="small" fullWidth name="coefficientParty"
                                   label="H??? s??? Ch???c v??? ?????ng/ ??o??n th???"
                                   defaultValue={structs.fee.coefficientParty}/>
                        <TextField size="small" fullWidth name="feeCoefficientSum"
                                   label="C???ng h??? s??? ???????c h?????ng"
                                   defaultValue={structs.fee.coefficientSum}/>
                        <TextField size="small" fullWidth name="feeSum" label="Th??nh ti???n"
                                   defaultValue={structs.fee.sum}/>
                        <TextField size="small" fullWidth name="specialJob"
                                   label="Ph??? c???p c??ng vi???c ?????c th??"
                                   defaultValue={structs.fee.specialJob}/>
                        <TextField size="small" fullWidth name="feeAddSum" label="C???ng ti???n"
                                   defaultValue={structs.fee.addSum}/>
                        <TextField size="small" fullWidth name="feeSubDayOff" label="Tr??? ng??y ngh???"
                                   defaultValue={structs.fee.subDayOff}/>
                        <TextField size="small" fullWidth name="feeRemain" label="Th???c nh???n"
                                   defaultValue={structs.fee.remain}/>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3} sx={{display: salaryType === "guide" ? "initial" : "none", "& > :not(style)": {my: 1}}}>
                        <Typography variant="h4" textAlign="center"><b>????? ??n</b></Typography>
                        <TextField size="small" fullWidth name="guideTableName" label="T??n l????ng"
                                   defaultValue={structs.guide.tableName}/>

                        <Typography textAlign="center"><b>C??c c???t</b></Typography>
                        <TextField size="small" fullWidth name="guideName" label="T??n"
                                   defaultValue={structs.guide.name.toString()}/>
                        <TextField size="small" fullWidth name="mission" label="Nhi???m v???"
                                   defaultValue={structs.guide.mission}/>
                        <TextField size="small" fullWidth name="studentCount"
                                   label="S??? sinh vi??n"
                                   defaultValue={structs.guide.studentCount}/>
                        <TextField size="small" fullWidth name="lessonCount" label="S??? ti???t/sv"
                                   defaultValue={structs.guide.lessonCount}/>
                        <TextField size="small" fullWidth name="price" label="????n gi??"
                                   defaultValue={structs.guide.price}/>
                        <TextField size="small" fullWidth name="guideSum" label="Th??nh ti???n"
                                   defaultValue={structs.guide.sum}/>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3} sx={{display: salaryType === "teach" ? "initial" : "none", "& > :not(style)": {my: 1}}}>
                        <Typography variant="h4" textAlign="center"><b>Ti???n l????ng gi???ng d???y</b></Typography>
                        <TextField size="small" fullWidth name="teachTableName" label="T??n l????ng gi???ng d???y"
                                   defaultValue={structs.teach.tableName}/>

                        <Typography textAlign="center"><b>C??c c???t</b></Typography>
                        <TextField size="small" fullWidth name="teachName" label="T??n"
                                   defaultValue={structs.teach.name.toString()}/>
                        <TextField size="small" fullWidth name="lessons" label="S??? ti???t ????ng k?? gi???ng d???y"
                                   defaultValue={structs.teach.lessons}/>
                        <TextField size="small" fullWidth name="exchangedLessons"
                                   label="T???ng s??? gi??? quy ?????i"
                                   defaultValue={structs.teach.exchangedLessons}/>
                        <TextField size="small" fullWidth name="superviseExam" label="Gi??? coi thi"
                                   defaultValue={structs.teach.superviseExam}/>
                        <TextField size="small" fullWidth name="subTeach" label="Tr??? ti???t chu???n gi???ng d???y"
                                   defaultValue={structs.teach.subTeach}/>
                        <TextField size="small" fullWidth name="subResearch" label="Tr??? ti???t chu???n NCKH"
                                   defaultValue={structs.teach.subResearch}/>
                        <TextField size="small" fullWidth name="subSum" label="T???ng ti???t chu???n"
                                   defaultValue={structs.teach.subSum}/>
                        <TextField size="small" fullWidth name="lessonSum"
                                   label="T???ng s??? ti???t sau khi tr??? gi??? chu???n"
                                   defaultValue={structs.teach.lessonSum}/>
                        <TextField size="small" fullWidth name="teachSum" label="Th??nh ti???n"
                                   defaultValue={structs.teach.sum}/>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3} sx={{display: salaryType === "welfare" ? "initial" : "none", "& > :not(style)": {my: 1}}}>
                        <Typography variant="h4" textAlign="center"><b>Ph??c l???i</b></Typography>

                        <TextField size="small" fullWidth name="welfareTableName" label="T??n ph??c l???i"
                                   defaultValue={structs.welfare.tableName}/>

                        <Typography textAlign="center"><b>C??c c???t</b></Typography>
                        <TextField size="small" fullWidth name="welfareName" label="T??n"
                                   defaultValue={structs.welfare.name.toString()}/>
                        <TextField size="small" fullWidth name="welfareSum" label="S??? ti???n"
                                   defaultValue={structs.welfare.sum}/>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4} lg={3} sx={{display: salaryType === "other" ? "initial" : "none", "& > :not(style)": {my: 1}}}>
                        <Typography variant="h4" textAlign="center"><b>Kho???n kh??c</b></Typography>

                        <TextField size="small" fullWidth name="otherTableName" label="T??n kho???n l????ng"
                                   defaultValue={structs.other.tableName}/>

                        <Typography>C??c c???t</Typography>
                        <TextField size="small" fullWidth name="otherName" label="T??n"
                                   defaultValue={structs.other.name.toString()}/>
                        <TextField size="small" fullWidth name="otherSum" label="S??? ti???n"
                                   defaultValue={structs.other.sum}/>
                    </Grid>
                </Grid>
                    : <></>
                }
            <Box sx={{display: "flex", justifyContent: "center", my: 1}}>
                <Button type="submit" variant="contained">C???p nh???t thay ?????i</Button>
            </Box>
        </Paper>
    );
}

export default SalaryStruct;