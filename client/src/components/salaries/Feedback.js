import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions, DialogContent,
    DialogTitle,
    Divider,
    IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
    TextField,
    Typography
} from "@mui/material";
import {Delete, Edit, MoreVert, Send} from "@mui/icons-material";
import {timeSince} from "../../utils/date";
import {useContext, useEffect, useState} from "react";
import request from "../../utils/request";
import context from "../../utils/context";
import {LoadingButton} from "@mui/lab";

function Feedback(props) {
    const {show, salaryId, dataId, salaryType} = props;
    const {startLoading, stopLoading, isLoading, error, success, role, auth, roles} = useContext(context);
    const [feedbacks, setFeedbacks] = useState([]);
    const [currentFeedbacks, setCurrentFeedbacks] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [actionType, setActionType] = useState("");
    const [feedbackIndex, setFeedbackIndex] = useState(null);
    const [replyIndex, setReplyIndex] = useState(null);
    const [dialogType, setDialogType] = useState(null);

    useEffect(() => {
        if (salaryId) getFeedbacks().then(data => setFeedbacks(data));
    }, [salaryId]);

    useEffect(() => {
        const currentFeedbacks = getCurrentFeedbacks(feedbacks);
        setCurrentFeedbacks(currentFeedbacks);
    }, [feedbacks, salaryId, salaryType, dataId]);

    const getFeedbacks = () => {
        startLoading();
        return new Promise((resolve, reject) => {
            request.get(`/salaries/${salaryId}/feedbacks`).then(res => {
                resolve(res.data.reverse());
                res.data.forEach((feedback, index) => {
                    feedback.feedbackIndex = index;
                    feedback.showReply = 1;
                });
                stopLoading();
            }).catch(err => reject(err));
        });
    }

    const handleOpenReply = (feedbackIndex) => {
        feedbacks[feedbackIndex].openReply = !feedbacks[feedbackIndex].openReply;
        setFeedbacks([...feedbacks]);
    }

    const handleShowMoreReply = (feedbackIndex) => {
        feedbacks[feedbackIndex].showReply = Math.min(feedbacks[feedbackIndex].showReply + 4, feedbacks[feedbackIndex].replies.length);
        setFeedbacks([...feedbacks]);
    }

    const getCurrentFeedbacks = (feedbacks) => {
        let currentFeedbacks = feedbacks ? feedbacks.filter(feedback => feedback.ref === dataId && feedback.type === salaryType).map((feedback, index) => {
            feedback.currentFeedbackIndex = index;
            return feedback;
        }) : [];

        return currentFeedbacks;
    }

    const handleFeedback = (e) => {
        e.preventDefault();
        const content = e.target.content.value;

        if (content === "") return;

        const data = {
            ref: dataId,
            type: salaryType,
            content: content,
        }

        startLoading();
        request.post(`/salaries/${salaryId}/feedbacks`, data).then(res => {
            feedbacks.unshift(res.data);
            feedbacks.forEach((feedback, index) => {
                feedback.feedbackIndex = index;
            });
            setFeedbacks([...feedbacks]);
            stopLoading();
            success("B??nh lu???n th??nh c??ng");
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });

        e.target.content.value = '';
    }

    const handleUpdateFeedback = (e, feedbackIndex) => {
        e.preventDefault();

        const data = {
            content: e.currentTarget.content.value,
        }

        startLoading();
        request.put(`/salaries/${salaryId}/feedbacks/${feedbacks[feedbackIndex]._id}`, data).then(res => {
            feedbacks[feedbackIndex].content = res.data.content;
            feedbacks[feedbackIndex].updatedAt = res.data.updatedAt;
            setFeedbacks([...feedbacks]);
            stopLoading();
            success("Ch???nh s???a ph???n h???i th??nh c??ng");
            setFeedbackIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });
    }

    const handleDeleteFeedback = (feedbackIndex) => {
        startLoading();
        request.delete(`/salaries/${salaryId}/feedbacks/${feedbacks[feedbackIndex]._id}`).then(res => {
            feedbacks.splice(feedbackIndex, 1);
            feedbacks.forEach((feedback, index) => {
                feedback.feedbackIndex = index;
            });
            setFeedbacks([...feedbacks]);
            stopLoading();
            success("X??a ph???n h???i th??nh c??ng");
            setFeedbackIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });
    }

    const handleReply = (e, feedbackIndex) => {
        e.preventDefault();

        const content = e.target.content.value;
        if (content === "") return;

        const data = {
            content: content,
        }

        startLoading();
        request.post(`/salaries/${salaryId}/feedbacks/${feedbacks[feedbackIndex]._id}/replies`, data).then(res => {
            feedbacks[feedbackIndex].openReply = false;
            feedbacks[feedbackIndex].replies.push(res.data);
            feedbacks[feedbackIndex].showReply = feedbacks[feedbackIndex].replies.length;
            setFeedbacks([...feedbacks]);
            stopLoading();
            success("Tr??? l???i b??nh lu???n th??nh c??ng");
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });

        e.target.content.value = '';
    }

    const handleUpdateReply = (e, feedbackIndex, replyIndex) => {
        e.preventDefault();
        const currentFeedback = currentFeedbacks[feedbackIndex];

        const data = {
            content: e.currentTarget.content.value,
        }

        startLoading();
        request.put(`/salaries/${salaryId}/feedbacks/${feedbacks[feedbackIndex]._id}/replies/${feedbacks[feedbackIndex].replies[replyIndex]._id}`, data).then(res => {
            feedbacks[feedbackIndex].replies[replyIndex].content = res.data.content;
            feedbacks[feedbackIndex].replies[replyIndex].updatedAt = res.data.updatedAt;
            setFeedbacks([...feedbacks]);
            stopLoading();
            success("Ch???nh s???a ph???n h???i th??nh c??ng");
            setFeedbackIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });
    }

    const handleDeleteReply = (feedbackIndex, replyIndex) => {
        startLoading();
        request.delete(`/salaries/${salaryId}/feedbacks/${feedbacks[feedbackIndex]._id}/replies/${feedbacks[feedbackIndex].replies[replyIndex]._id}`).then(res => {
            feedbacks[feedbackIndex].replies.splice(replyIndex, 1);
            setFeedbacks([...feedbacks]);
            stopLoading();
            success("X??a tr??? l???i th??nh c??ng");
            setFeedbackIndex(null);
            setReplyIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });
    }

    const handleOpenDialog = (action) => {
        setDialogType(action);
    }

    const handleCloseDialog = () => {
        setDialogType(null);
    }

    return (
        <Box sx={{display: show ? "flex" : "none", width: "100%", height: "100%", flexDirection: "column"}}>

            {role.name === "teacher" ?
                <form onSubmit={handleFeedback}>
                    <TextField
                        fullWidth
                        name="content"
                        size="small"
                        label="Ph???n h???i"
                        InputProps={{
                            endAdornment: <IconButton type="submit"><Send/></IconButton>
                        }}
                        sx={{mb: 1}}
                    />
                </form>
                : <></>
            }

            <Typography sx={{textAlign: "center"}}>{currentFeedbacks.length ? currentFeedbacks.length : "Ch??a c??"} ph???n h???i</Typography>
            <Divider />
            <Box sx={{flexGrow: 1, height: 0, overflowY: "auto"}}>
                {currentFeedbacks.map((feedback) =>
                    <Box key={feedback.currentFeedbackIndex}>
                        <Divider />
                        <Box sx={{display: "flex", my: 1}}>
                            {role.name !== "teacher" ?
                                <Avatar
                                    sx={{mr: 1}}>{feedback.user.name.last.charAt(0)}</Avatar>
                                : <></>
                            }
                            <Box sx={{flexGrow: 1}}>
                                {role.name !== "teacher" ?
                                    <Typography
                                        sx={{fontWeight: "bold"}}>{feedback.user.name.first} {feedback.user.name.last}</Typography>
                                        : <></>
                                }
                                <Typography sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}>
                                    <Typography sx={role.name === "teacher" ? {fontWeight: "bold", mt: 1} : {} }>{feedback.content}</Typography>
                                    <IconButton onClick={(e) => {
                                        setAnchorEl(e.currentTarget);
                                        setActionType("feedback");
                                        setFeedbackIndex(feedback.feedbackIndex);
                                    }}>
                                        <MoreVert fontSize="small"/>
                                    </IconButton>
                                </Typography>
                                <Button
                                    onClick={() => handleOpenReply(feedback.feedbackIndex)}>Tr???
                                    l???i</Button>

                                <Typography sx={{display: "inline"}}
                                            variant="body2">{timeSince(new Date(feedback.createdAt))}</Typography>

                                {feedback.replies?.slice(0, feedback.showReply).map((reply, replyIndex) =>
                                    <Box key={replyIndex} sx={{display: "flex"}}>
                                        <Avatar
                                            sx={{
                                                mr: 1,
                                                width: 30,
                                                height: 30,
                                                fontSize: 15
                                            }}>{reply.user.name.last.charAt(0)}</Avatar>
                                        <Box sx={{flex: 1}}>
                                            <Typography
                                                sx={{fontWeight: "bold"}}>{reply.user.name.first} {reply.user.name.last} ({roles[reply.user.role].label})</Typography>
                                            <Typography sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between"
                                            }}>
                                                <Typography>{reply.content}</Typography>
                                                {role.name !== "teacher" || (role.name === "teacher" && auth._id === reply.user._id) ?
                                                    <IconButton onClick={(e) => {
                                                        setAnchorEl(e.currentTarget);
                                                        setActionType("reply");
                                                        setFeedbackIndex(feedback.feedbackIndex);
                                                        setReplyIndex(replyIndex);
                                                    }}>
                                                        <MoreVert fontSize="small"/>
                                                    </IconButton>
                                                    : <></>
                                                }
                                            </Typography>
                                            <Button
                                                onClick={() => handleOpenReply(feedback.feedbackIndex)}>Tr???
                                                l???i</Button>

                                            <Typography sx={{display: "inline"}}
                                                        variant="body2">{timeSince(new Date(reply.createdAt))}</Typography>
                                        </Box>
                                    </Box>
                                )}

                                <Button
                                    sx={{display: feedback.showReply < feedback.replies.length ? "inherit" : "none"}}
                                    onClick={() => handleShowMoreReply(feedback.feedbackIndex)}>Xem
                                    th??m tr??? l???i</Button>

                                <form onSubmit={(e) => handleReply(e, feedback.feedbackIndex)}>
                                    <TextField
                                        fullWidth
                                        name="content"
                                        size="small"
                                        label="Tr??? l???i"
                                        sx={{display: feedback.openReply ? "inherit" : "none"}}
                                        InputProps={{
                                            endAdornment: <IconButton type="submit"><Send/></IconButton>
                                        }}
                                    />
                                </form>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>

            <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => {
                    handleOpenDialog(`${actionType}-update`);
                    setAnchorEl(null);
                }}>
                    <ListItemIcon><Edit/></ListItemIcon>
                    <ListItemText>Ch???nh s???a</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    handleOpenDialog(`${actionType}-delete`);
                    setAnchorEl(null);
                }}>
                    <ListItemIcon><Delete/></ListItemIcon>
                    <ListItemText>X??a</ListItemText>
                </MenuItem>
            </Menu>

            <Dialog open={dialogType === "feedback-update"} onClose={() => {
                handleCloseDialog();
                setFeedbackIndex(null);
            }}>
                <form onSubmit={(e) => handleUpdateFeedback(e, feedbackIndex)}>
                    <DialogTitle sx={{textAlign: "center"}}>Ch???nh s???a ph???n h???i</DialogTitle>
                    <DialogContent>
                        {feedbackIndex !== null ?
                            <>
                                <TextField size="small" sx={{mt: 1}} fullWidth name="content" label="N???i dung ph???n h???i"
                                           defaultValue={feedbacks[feedbackIndex]?.content}/>
                            </>
                            : <></>}
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "center"}}>
                        <Button variant="outlined" onClick={handleCloseDialog}>H???y</Button>
                        <LoadingButton loading={isLoading} variant="contained" type="submit" >C???p nh???t</LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={dialogType === "feedback-delete"} onClose={() => {
                handleCloseDialog();
                setFeedbackIndex(null);
            }}>
                <DialogTitle sx={{textAlign: "center"}}>X??a ph???n h???i</DialogTitle>
                <DialogActions>
                    <Button variant="outlined" onClick={handleCloseDialog}>H???y</Button>
                    <LoadingButton loading={isLoading} type="submit" variant="contained" color="error"
                                   onClick={() => handleDeleteFeedback(feedbackIndex)}>X??a</LoadingButton>
                </DialogActions>
            </Dialog>

            <Dialog open={dialogType === "reply-update"} onClose={() => {
                handleCloseDialog();
                setFeedbackIndex(null);
                setReplyIndex(null);
            }}>
                <form onSubmit={(e) => handleUpdateReply(e, feedbackIndex, replyIndex)}>
                    <DialogTitle sx={{textAlign: "center"}}>Ch???nh s???a tr??? l???i</DialogTitle>
                    <DialogContent>
                        {feedbackIndex !== null && replyIndex !== null ?
                            <>
                                <TextField sx={{mt: 1}} size="small" fullWidth name="content" label="N???i dung tr??? l???i"
                                           defaultValue={feedbacks[feedbackIndex]?.replies[replyIndex]?.content}/>
                            </>
                            : <></>}
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "center"}}>
                        <Button variant="outlined" onClick={handleCloseDialog} >H???y</Button>
                        <LoadingButton loading={isLoading} type="submit" variant="contained" color="error">Ch???nh s???a</LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={dialogType === "reply-delete"} onClose={() => {
                handleCloseDialog();
                setFeedbackIndex(null);
                setReplyIndex(null);
            }}>
                <DialogTitle sx={{textAlign: "center"}}>X??a tr??? l???i</DialogTitle>
                <DialogActions>
                    <Button variant="outlined" onClick={handleCloseDialog}>H???y</Button>
                    <LoadingButton loading={isLoading} type="submit" color="error" variant="contained"
                                   onClick={() => handleDeleteReply(feedbackIndex, replyIndex)}>X??a</LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Feedback;