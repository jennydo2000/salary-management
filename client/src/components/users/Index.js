import {Add, AttachFile, Delete, Edit, MoreVert, Refresh, Search} from "@mui/icons-material";
import {useContext, useEffect, useRef, useState} from "react";
import context from "../../utils/context";
import request from "../../utils/request";
import {
    Autocomplete,
    Avatar, Chip, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, InputLabel,
    Paper, Radio, RadioGroup, Select, Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {
    Typography,
    IconButton,
    Box,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    InputAdornment,
} from "@mui/material";
import {useParams} from "react-router-dom";
import {formatDate} from "../../utils/date";
import {Alert, DesktopDatePicker} from "@mui/lab";
import Import from "./Import";
import {handleError} from "../../utils/error";

function Index() {
    const {type} = useParams();
    const searchRef = useRef(null);

    const {isLoading, startLoading, stopLoading, error, success} = useContext(context);
    const [users, setUsers] = useState({});
    const [departments, setDepartments] = useState([]);
    const [currentUserIndex, setCurrentUserIndex] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(null);
    const [errors, setErrors] = useState({});
    const [typingTimeoutId, setTypingTimeoutId] = useState(null);
    const [date, setDate] = useState({
        dob: new Date(),
        startedDate: new Date(),
    });

    useEffect(() => {
        setUsers({});
        refresh();
        setCurrentUserIndex(null);
    }, [type]);

    const refresh = () => {
        getUsers().then(data => setUsers(data));
        getDepartments().then(data => setDepartments(data));
    }

    const getUsers = (config = {search: null, page: 1, filter: {}}) => {
        let path = `/users?query&type=${type}`;
        if (config.search) path += "&keyword=" + config.search;
        if (config.page) path += "&page=" + config.page;
        Object.keys(config.filter || {}).map(filter => {
            path += `&${filter}=` + config.filter[filter].toString();
        })
        startLoading(true);
        return new Promise(((resolve, reject) => {
            request.get(path).then((res) => {
                if (res.data.currentPage === res.data.lastPage)
                    res.data.endPage = true;
                stopLoading();
                resolve(res.data);
            }).catch(err => {
                error("C?? l???i x???y ra");
                stopLoading();
                reject();
            });
        }))
    };

    const getDepartments = () => {
        return new Promise(((resolve, reject) => {
            request.get("/departments?all=1").then(res => {
                resolve(res.data);
            }).catch(err => reject());
        }));
    }

    const handleChangeSearch = (e) => {
        const keyword = e.currentTarget.value;

        if (typingTimeoutId) clearTimeout(typingTimeoutId);

        const timeoutId = setTimeout(() => {
            getUsers({search: keyword}).then(data => setUsers(data));
        }, 1000);
        setTypingTimeoutId(timeoutId);
    };

    const handleFilter = (v) => {
        const filter = v.map(filter => filter._id);
        getUsers({search: searchRef.current.value, filter: {"department": filter}}).then(data => setUsers(data));
    }

    const handleScrollUser = (e) => {
        if ((e.currentTarget.offsetHeight + e.currentTarget.scrollTop >= e.currentTarget.scrollHeight - 300) && !isLoading && !users.endPage) {
            startLoading();
            getUsers({search: users.keyword, page: users.currentPage + 1}).then(newPosts => {
                users.data = users.data.concat(newPosts.data);
                users.currentPage = newPosts.currentPage;
                //if (users.currentPage === users.lastPage)
                users.endPage = newPosts.endPage;
                stopLoading();
                setUsers(users);
            }).catch(() => {
                stopLoading();
                error("T???i xu???ng kho???n m???i m???i b??? l???i");
            });
        }
    }

    const handleOpenMenu = (e, index) => {
        setAnchorEl(e.currentTarget);
        setCurrentUserIndex(index);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleOpenDialog = (type) => {
        handleCloseMenu();
        setOpen(type);
    };

    const handleCloseDialog = () => {
        setOpen(null);
        setErrors({});
    };

    const handleInsert = (e) => {
        e.preventDefault();

        if (e.currentTarget.password.value !== e.currentTarget.repassword.value) {
            setErrors({
                password: {
                    message: "M???t kh???u v?? nh???p l???i m???t kh???u kh??ng gi???ng nhau",
                }
            });
            return;
        }

        const body = {
            username: e.currentTarget.username.value,
            name: {
                first: e.currentTarget.firstName.value,
                last: e.currentTarget.lastName.value,
            },
            password: e.currentTarget.password.value,
            email: e.currentTarget.email.value,
            ...(
                type === "teacher" ?
                    {
                        gender: e.currentTarget.gender.value,
                        dob: e.currentTarget.dob.value,
                        address: e.currentTarget.address.value,
                        department: e.currentTarget.department.value,
                        startedDate: e.currentTarget.startedDate.value,
                        coefficientSalary: e.currentTarget.coefficientSalary.value,
                    } : {}
            )
        };

        request
            .post(`/users?type=${type}`, body)
            .then((res) => {
                success("Th??m th??nh c??ng");
                getUsers().then(data => setUsers(data));
                handleCloseDialog();
            })
            .catch((err) => setErrors(handleError(err.response.data)));
    };

    const handleUpdate = (e) => {
        e.preventDefault();

        if (e.currentTarget.password.value !== e.currentTarget.repassword.value) {
            setErrors({
                password: {
                    message: "M???t kh???u v?? nh???p l???i m???t kh???u kh??ng gi???ng nhau",
                }
            });
            return;
        }

        const body = {
            name: {
                first: e.currentTarget.firstName.value,
                last: e.currentTarget.lastName.value,
            },
            email: e.currentTarget.email.value,
            ...(
                type === "teacher" ?
                    {
                        gender: e.currentTarget.gender.value,
                        dob: e.currentTarget.dob.value,
                        address: e.currentTarget.address.value,
                        department: e.currentTarget.department.value,
                        startedDate: e.currentTarget.startedDate.value,
                        coefficientSalary: e.currentTarget.coefficientSalary.value,
                    } : {}
            ),
            ... e.currentTarget.password.value ? {password: e.currentTarget.password.value} : {},
        };

        request
            .put(`/users/${users.data[currentUserIndex]._id}?type=${type}`, body)
            .then((res) => {
                success("Ch???nh s???a th??nh c??ng");
                getUsers().then(data => setUsers(data));
                handleCloseDialog();
            })
            .catch((err) => setErrors(handleError(err.response.data)));
    };

    const handleDelete = () => {
        request.delete(`/users/${users.data[currentUserIndex]._id}`).then((res) => {
            success("X??a th??nh c??ng");
            users.data.splice(currentUserIndex, 1);
            setUsers(users);
            handleCloseDialog();
        }).catch(err => {
            error("T??i kho???n n??y kh??ng th??? x??a");
        });
    };

    const renderInput = (inputType, defaultValues = {}) => (
        <>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <TextField
                    size="small"
                    error={Boolean(errors["name.first"])}
                    helperText={
                        errors["name.first"]
                            ? errors["name.first"].message
                            : ""
                    }
                    defaultValue={defaultValues?.name?.first}
                    sx={{width: "49%"}}
                    variant="outlined"
                    label="H???"
                    name="firstName"
                />
                <TextField
                    size="small"
                    error={Boolean(errors["name.last"])}
                    helperText={
                        errors["name.last"]
                            ? errors["name.last"].message
                            : ""
                    }
                    defaultValue={defaultValues?.name?.last}
                    sx={{width: "49%"}}
                    variant="outlined"
                    label="T??n"
                    name="lastName"
                />
            </Box>
            <TextField
                size="small"
                error={Boolean(errors.username)}
                helperText={
                    errors.username ? errors.username.message : "T??n t??i kho???n d??ng ????ng nh???p, s??? d???ng k?? t??? a-z, 0-9 v?? (.)"
                }
                disabled={inputType === "edit"}
                defaultValue={defaultValues?.username}
                fullWidth
                variant="outlined"
                label="T??n t??i kho???n"
                name="username"
            />
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <TextField
                    size="small"
                    error={Boolean(errors.password)}
                    helperText={
                        errors.password ? errors.password.message : ""
                    }
                    fullWidth
                    variant="outlined"
                    label={inputType === "create" ? "M???t kh???u" : "M???t kh???u m???i"}
                    name="password"
                    type="password"
                    sx={{width: "49%"}}
                />
                <TextField
                    size="small"
                    error={Boolean(errors.password)}
                    helperText={
                        errors.password ? errors.password.message : ""
                    }
                    fullWidth
                    variant="outlined"
                    label="Nh???p l???i m???t kh???u"
                    name="repassword"
                    type="password"
                    sx={{width: "49%"}}
                />
            </Box>
            <TextField
                size="small"
                error={Boolean(errors.email)}
                helperText={
                    errors.email ? errors.email.message : "Email ????? g???i th??ng b??o, c???p nh???t..."
                }
                defaultValue={defaultValues?.email}
                fullWidth
                variant="outlined"
                label="Email"
                name="email"
            />

            {type === "teacher" ?
                <>
                    <FormGroup>
                        <FormLabel>Gi???i t??nh</FormLabel>
                        <RadioGroup defaultValue={defaultValues?.gender || "male"}>
                            <FormControlLabel control={<Radio name="gender"/>} label="Nam" value="male"/>
                            <FormControlLabel control={<Radio name="gender"/>} label="N???" value="female"/>
                        </RadioGroup>
                    </FormGroup>
                    <DesktopDatePicker
                        label="Ng??y sinh"
                        value={date.dob}
                        onChange={(date) => {
                            date.dob = date;
                            setDate(date);
                        }}
                        renderInput={(params) => <TextField size="small" fullWidth name="dob" {...params} />}
                    />
                    <TextField
                        size="small"
                        error={Boolean(errors.address)}
                        helperText={
                            errors.address ? errors.address.message : ""
                        }
                        defaultValue={defaultValues?.address}
                        fullWidth
                        variant="outlined"
                        label="?????a ch???"
                        name="address"
                    />
                    <FormControl fullWidth>
                        <InputLabel>Ph??ng ban</InputLabel>
                        <Select
                            size="small"
                            label="Ph??ng ban"
                            inputProps={{name: "department"}}
                            defaultValue={defaultValues?.department?._id}
                            error={Boolean(errors.department)}
                        >
                            {departments.map((department, index) =>
                                <MenuItem key={index} value={department._id}>{department.name}</MenuItem>
                            )}
                        </Select>
                        <FormHelperText
                            error={Boolean(errors.department)}>{errors.department ? errors.department.message : ""}</FormHelperText>
                    </FormControl>
                    <DesktopDatePicker
                        label="Ng??y v??o l??m vi???c"
                        value={date.startedDate}
                        onChange={(date) => {
                            date.startedDate = date;
                            setDate(date)
                        }}
                        renderInput={(params) => <TextField size="small" fullWidth name="startedDate" {...params} />}
                    />
                    <TextField
                        size="small"
                        error={Boolean(errors.coefficientSalary)}
                        helperText={
                            errors.coefficientSalary ? errors.coefficientSalary.message : ""
                        }
                        defaultValue={defaultValues?.coefficientSalary}
                        fullWidth
                        variant="outlined"
                        label="H??? s??? l????ng"
                        name="coefficientSalary"
                        type="number"
                        inputProps={{step: 0.01}}
                    />
                </>
                : <></>
            }
        </>
    )

    return (
        <>
            <Paper sx={{p: 1, mb: 1, display: "flex", flexDirection: "column", alignItems: "center"}}>
                {/* Title */}
                <Typography
                    variant="h4"
                    align="center"
                >
                    <b>T??i kho???n {type === "admin" ? "ng?????i qu???n tr???" : type === "input" ? "ng?????i nh???p li???u" : "C??n b??? - Gi???ng vi??n"}</b>
                </Typography>

                {/* Action buttons */}
                <Box sx={{mb: 2, "& > :not(style)": {mr: 1}}}>
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<Add/>}
                        onClick={() => handleOpenDialog("create")}
                    >
                        Th??m
                    </Button>

                    {type === "teacher" ?
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<AttachFile/>}
                            onClick={() => {
                                handleOpenDialog("import");
                            }}
                        >
                            Nh???p t??? file
                        </Button>
                        : <></>
                    }

                    <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<Refresh/>}
                        onClick={() => refresh()}
                    >
                        L??m m???i
                    </Button>
                </Box>

                {/* Search box */}
                <Box sx={{display: "flex"}}>
                    <TextField
                        variant="outlined"
                        size="small"
                        type="search"
                        label="T??m ki???m t??i kho???n"
                        sx={{ width: 300, mr: 1 }}
                        onChange={handleChangeSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search/>
                                </InputAdornment>
                            ),
                            ref: searchRef
                        }}
                    />
                    {type === "teacher" &&
                        <Autocomplete
                            sx={{width: 300}}
                            multiple
                            renderInput={(params) => <TextField {...params} size="small" placeholder="Ph??ng ban"/>}
                            options={departments}
                            getOptionLabel={(option) => option.name}
                            onChange={(e, v) => handleFilter(v)}
                        />
                    }
                </Box>
            </Paper>

            {/*User list*/}
            <TableContainer component={Paper} sx={{flexGrow: 1}} onScroll={handleScrollUser}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">???nh ?????i di???n</TableCell>
                            <TableCell align="center">T??n t??i kho???n</TableCell>
                            <TableCell align="center">H??? v?? t??n</TableCell>
                            <TableCell align="center">Email</TableCell>
                            {type === "teacher" ?
                                <>
                                    <TableCell align="center">Gi???i t??nh</TableCell>
                                    <TableCell align="center">Ng??y sinh</TableCell>
                                    <TableCell align="center">?????a ch???</TableCell>
                                    <TableCell align="center">Ph??ng ban</TableCell>
                                    <TableCell align="center">Ng??y b???t ?????u l??m vi???c</TableCell>
                                    <TableCell align="center">H??? s??? l????ng</TableCell>
                                </>
                                : <></>
                            }
                            <TableCell align="center">Ch???c n??ng</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users?.data?.map((user, index) =>
                            <TableRow key={index}>
                                <TableCell align="center">
                                    <Box sx={{display: "flex", justifyContent: "center"}}>
                                        <Avatar>{user.name.last.charAt(0)}</Avatar>
                                    </Box>
                                </TableCell>
                                <TableCell align="center"><Chip label={user.username}/></TableCell>
                                <TableCell align="center">{user.name.first} {user.name.last}</TableCell>
                                <TableCell align="center"><Chip label={user.email}/></TableCell>
                                {type === "teacher" ?
                                    <>
                                        <TableCell align="center">{user?.gender === "male" ? "Nam" : user?.gender === "female" ? "N???" : ""}</TableCell>
                                        <TableCell align="center">{formatDate(new Date(user.dob))}</TableCell>
                                        <TableCell align="center">{user?.address}</TableCell>
                                        <TableCell align="center">{user?.department?.name}</TableCell>
                                        <TableCell align="center">{formatDate(new Date(user?.startedDate))}</TableCell>
                                        <TableCell align="center">{user?.coefficientSalary}</TableCell>
                                    </>
                                    : <></>
                                }
                                <TableCell align="center">
                                    <IconButton onClick={(e) => {
                                        handleOpenMenu(e, index);
                                        setDate({
                                            dob: users.data[index].dob,
                                            startedDate: users.data[index].startedDate,
                                        });
                                    }}>
                                        <MoreVert/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )}
                        {isLoading ?
                            <TableRow>
                                <TableCell><Skeleton variant="circular" width={40} height={40}/></TableCell>
                                <TableCell><Skeleton variant="text"/></TableCell>
                                <TableCell><Skeleton variant="text"/></TableCell>
                                <TableCell><Skeleton variant="text"/></TableCell>
                                {type === "teacher" ?
                                    <>
                                        <TableCell><Skeleton variant="text"/></TableCell>
                                        <TableCell><Skeleton variant="text"/></TableCell>
                                        <TableCell><Skeleton variant="text"/></TableCell>
                                        <TableCell><Skeleton variant="text"/></TableCell>
                                        <TableCell><Skeleton variant="text"/></TableCell>
                                        <TableCell><Skeleton variant="text"/></TableCell>
                                    </>
                                    : <></>
                                }
                                <TableCell><Skeleton variant="text" width={50}/></TableCell>
                            </TableRow>
                            : <></>
                        }
                    </TableBody>
                </Table>

                {!isLoading && users.endPage ?
                    <Box sx={{display: "flex", justifyContent: "center"}}>
                        <Chip sx={{my: 2}} label="???? xem h???t danh s??ch t??i kho???n" />
                    </Box>
                    : <></>
                }
            </TableContainer>

            {/* Item menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={() => handleOpenDialog("edit")}>
                    <ListItemIcon>
                        <Edit/>
                    </ListItemIcon>
                    <ListItemText>Ch???nh s???a</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleOpenDialog("delete")}>
                    <ListItemIcon>
                        <Delete/>
                    </ListItemIcon>
                    <ListItemText>X??a</ListItemText>
                </MenuItem>
            </Menu>

            {/* Create dialog */}
            <Dialog open={open === "create"} onClose={handleCloseDialog}>
                <form onSubmit={handleInsert}>
                    <DialogTitle sx={{textAlign: "center"}}>Th??m t??i kho???n m???i</DialogTitle>
                    <DialogContent sx={{"& > :not(style)": {my: 1}}}>
                        {renderInput("create", {})}
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "center"}}>
                        <Button variant="outlined" onClick={handleCloseDialog}>????ng</Button>
                        <Button type="submit" variant="contained" color="primary">Th??m</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={open === "edit"} onClose={() => {
                handleCloseDialog();
                setCurrentUserIndex(null);
            }}>
                <form onSubmit={handleUpdate}>
                    <DialogTitle sx={{textAlign: "center"}}>Ch???nh s???a t??i kho???n</DialogTitle>
                    <DialogContent sx={{"& > :not(style)": {my: 1}}}>
                        {currentUserIndex !== null ?
                            renderInput("edit", users.data[currentUserIndex])
                            : <></>
                        }
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "center"}}>
                        <Button variant="outlined" onClick={handleCloseDialog}>????ng</Button>
                        <Button type="submit" variant="contained" color="primary">Ch???nh s???a</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={open === "delete"} onClose={() => {
                handleCloseDialog();
                setCurrentUserIndex(null);
            }}>
                <DialogTitle sx={{textAlign: "center"}}>X??c nh???n x??a t??i kho???n</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">B???n c?? mu???n x??a? D??? li???u s??? kh??ng ???????c kh??i ph???c!</Alert>
                </DialogContent>
                <DialogActions sx={{justifyContent: "center"}}>
                    <Button variant="outlined" onClick={handleCloseDialog}>
                        ????ng
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                    >
                        X??a
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Import dialog */}
            <Dialog fullWidth maxWidth="lg" open={open === "import"} onClose={() => handleCloseDialog()}>
                <DialogTitle sx={{textAlign: "center"}}>Nh???p danh s??ch t??? file</DialogTitle>
                <DialogContent sx={{display: "flex", flexDirection: "column", height: "100vh"}}>
                    <Import onImportUser={() => {
                        handleCloseDialog();
                        refresh();
                    }} />
                </DialogContent>
                <DialogActions sx={{justifyContent: "center"}}>
                    <Button variant="outlined" onClick={handleCloseDialog}>
                        ????ng
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Index;
