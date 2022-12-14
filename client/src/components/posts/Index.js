import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControlLabel, Grid,
    IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Skeleton, TableContainer,
    TextField,
    Typography
} from "@mui/material";
import {Delete, Edit, Fullscreen, MoreVert, Search, Send} from "@mui/icons-material";
import {useContext, useEffect, useState} from "react";
import request from "../../utils/request";
import context from "../../utils/context";
import {timeSince} from "../../utils/date";
import {LoadingButton} from "@mui/lab";
import {useNavigate} from "react-router-dom";
import {handleError} from "../../utils/error";
import {DropzoneArea} from "material-ui-dropzone";

function Index() {
    const {isLoading, startLoading, stopLoading, success, error, auth, role, roles} = useContext(context);
    const navigate = useNavigate();
    const [posts, setPosts] = useState({});
    const [dialogType, setDialogType] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [actionType, setActionType] = useState("");
    const [currentPostIndex, setCurrentPostIndex] = useState(null);
    const [currentCommentIndex, setCurrentCommentIndex] = useState(null);
    const [currentReplyIndex, setCurrentReplyIndex] = useState(null);
    const [typingTimeoutId, setTypingTimeoutId] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        refresh();
    }, []);

    const refresh = () => {
        setPosts({});
        getPosts().then(posts => setPosts(posts));
    }

    const getPosts = (config = {search: null, page: 1}) => {
        let path = "/posts?query";
        if (config.page) path += "&page=" + config.page;
        if (config.search) path += "&keyword=" + config.search;
        startLoading();
        return new Promise((resolve, reject) => {
            request.get(path).then(res => {
                let posts = res.data.data;
                posts = posts.map(post => {
                    post.comments = post.comments.reverse();
                    return post;
                });

                posts.forEach(post => {
                    post.showComment = 1;
                    post.commentCount = post.comments.length + post.comments.reduce((sum, comment) => {
                        comment.showReply = 1;
                        return sum + comment.replies.length;
                    }, 0);
                });

                if (res.data.currentPage === res.data.lastPage)
                    res.data.endPage = true;

                res.data.data = posts;
                stopLoading();
                resolve(res.data);
            }).catch(res => {
                stopLoading();
                error("C?? l???i x???y ra");
                reject();
            });
        })
    }

    const handleSearchPost = (e) => {
        const keyword = e.currentTarget.value;

        if (typingTimeoutId) clearTimeout(typingTimeoutId);

        const timeoutId = setTimeout(() => {
            getPosts({search: keyword}).then(posts => setPosts(posts));
        }, 1000);
        setTypingTimeoutId(timeoutId);
    }

    const handleScrollPost = (e) => {
        if ((e.currentTarget.offsetHeight + e.currentTarget.scrollTop >= e.currentTarget.scrollHeight - 300) && !isLoading && !posts.endPage) {
            startLoading();
            getPosts({search: posts.keyword, page: posts.currentPage + 1}).then(newPosts => {
                posts.data = posts.data.concat(newPosts.data);
                posts.currentPage = newPosts.currentPage;
                posts.endPage = newPosts.endPage;
                stopLoading();
                setPosts(posts);
            }).catch(() => {
                stopLoading();
                error("T???i xu???ng b??i ????ng m???i b??? l???i");
            });
        }
    }

    const handleShowMoreComment = (postIndex) => {
        posts.data[postIndex].showComment = Math.min(posts.data[postIndex].showComment + 4, posts.data[postIndex].comments.length);
        setPosts({...posts});
    }

    const handleShowMoreReply = (postIndex, commentIndex) => {
        posts.data[postIndex].comments[commentIndex].showReply = Math.min(posts.data[postIndex].comments[commentIndex].showReply + 4, posts.data[postIndex].comments[commentIndex].replies.length);
        setPosts({...posts});
    }

    const handleOpenReply = (postIndex, commentIndex) => {
        posts.data[postIndex].comments[commentIndex].openReply = true;
        setPosts({...posts});
    }

    const handleCloseDialog = () => {
        setDialogType(null);
    }

    const handleOpenDialog = (type) => {
        setDialogType(type);
    }

    const handleCreatePost = (e) => {
        e.preventDefault();
        const data = {
            title: e.currentTarget.title.value,
            content: e.currentTarget.content.value,
            sendMail: e.currentTarget.sendMail.checked,
        }

        startLoading();
        request.post("/posts", data).then(res => {
            getPosts().then(posts => setPosts(posts));
            stopLoading();
            success("Th??m b??i ????ng th??nh c??ng");
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
            setErrors(handleError(err.response.data));
        });
    }

    const handleEditPost = (e, postIndex) => {
        e.preventDefault();
        const data = {
            title: e.currentTarget.title.value,
            content: e.currentTarget.content.value,
        }
        startLoading();
        request.put(`/posts/${posts.data[postIndex]._id}`, data).then(res => {
            posts.data[postIndex].title = res.data.title;
            posts.data[postIndex].content = res.data.content;
            setPosts(posts);
            stopLoading();
            success("Ch???nh s???a b??i ????ng th??nh c??ng");
            setCurrentPostIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
            setErrors(handleError(err.response.data));
        });
    }

    const handleDeletePost = (postIndex) => {
        startLoading();
        request.delete(`/posts/${posts.data[postIndex]._id}`).then(res => {
            posts.data.splice(postIndex, 1);
            setPosts(posts);
            stopLoading();
            success("X??a b??i ????ng th??nh c??ng");
            setCurrentPostIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });
    }

    const handleComment = (e, postIndex) => {
        const content = e.target.value;

        if (content === "") return;

        const data = {
            content: content,
        }

        startLoading();
        request.post(`/posts/${posts.data[postIndex]._id}/comments`, data).then(res => {
            posts.data[postIndex].comments.unshift(res.data);
            setPosts(posts);
            stopLoading();
            success("B??nh lu???n th??nh c??ng");
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });

        e.target.value = '';
    }

    const handleEditComment = (e, postIndex, commentIndex) => {
        e.preventDefault();
        const data = {
            content: e.currentTarget.content.value,
        }
        startLoading();
        request.put(`/posts/${posts.data[postIndex]._id}/comments/${posts.data[postIndex].comments[commentIndex]._id}`, data).then(res => {
            posts.data[postIndex].comments[commentIndex].content = res.data.content;
            setPosts(posts);
            stopLoading();
            success("Ch???nh s???a b??nh lu???n th??nh c??ng");
            setCurrentPostIndex(null);
            setCurrentCommentIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });
    }

    const handleDeleteComment = (postIndex, commentIndex) => {
        startLoading();
        request.delete(`/posts/${posts.data[postIndex]._id}/comments/${posts.data[postIndex].comments[commentIndex]._id}`).then(res => {
            posts.data[postIndex].comments.splice(commentIndex, 1);
            setPosts(posts);
            stopLoading();
            success("X??a b??nh lu???n th??nh c??ng");
            setCurrentPostIndex(null);
            setCurrentCommentIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });
    }

    const handleReply = (e, postIndex, commentIndex) => {
        const content = e.target.value;

        if (content === "") return;

        const data = {
            content: content,
        }

        startLoading();
        request.post(`/posts/${posts.data[postIndex]._id}/comments/${posts.data[postIndex].comments[commentIndex]._id}/replies`, data).then(res => {
            posts.data[postIndex].comments[commentIndex].openReply = false;
            posts.data[postIndex].comments[commentIndex].replies.push(res.data);
            posts.data[postIndex].comments[commentIndex].showComment = posts.data[postIndex].comments[commentIndex].replies.length;
            setPosts(posts);
            stopLoading();
            success("Tr??? l???i b??nh lu???n th??nh c??ng");
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });

        e.target.value = '';
    }

    const handleEditReply = (e, postIndex, commentIndex, replyIndex) => {
        e.preventDefault();
        const data = {
            content: e.currentTarget.content.value,
        }
        startLoading();
        request.put(`/posts/${posts.data[postIndex]._id}/comments/${posts.data[postIndex].comments[commentIndex]._id}/replies/${posts.data[postIndex].comments[commentIndex].replies[replyIndex]._id}`, data).then(res => {
            posts.data[postIndex].comments[commentIndex].replies[replyIndex].content = res.data.content;
            setPosts(posts);
            stopLoading();
            success("Ch???nh s???a tr??? l???i th??nh c??ng");
            setCurrentPostIndex(null);
            setCurrentCommentIndex(null);
            setCurrentReplyIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });
    }

    const handleDeleteReply = (postIndex, commentIndex, replyIndex) => {
        startLoading();
        request.delete(`/posts/${posts.data[postIndex]._id}/comments/${posts.data[postIndex].comments[commentIndex]._id}/replies/${posts.data[postIndex].comments[commentIndex].replies[replyIndex]._id}`).then(res => {
            posts.data[postIndex].comments[commentIndex].replies.splice(replyIndex, 1);
            setPosts(posts);
            stopLoading();
            success("X??a tr??? l???i th??nh c??ng");
            setCurrentPostIndex(null);
            setCurrentCommentIndex(null);
            setCurrentReplyIndex(null);
            handleCloseDialog();
        }).catch(err => {
            error("C?? l???i x???y ra");
            stopLoading();
        });
    }

    return (
        <>
            <Paper sx={{position: "relative", p: 1, mb: 1, display: "flex", flexDirection: "column", alignItems: "center"}}>
                <IconButton sx={{position: "absolute", top: 0, right: 0}} onClick={() => navigate("/posts")}>
                    <Fullscreen />
                </IconButton>

                <Typography variant="h4" sx={{fontWeight: "bold"}}>B??i ????ng</Typography>

                <Box sx={{mb: 2, "& > :not(style)": {mr: 1}}}>
                    {role.name !== "teacher" ?
                        <Button variant="contained" onClick={() => handleOpenDialog("post-create")}>Th??m b??i ????ng
                            m???i</Button>
                        : <></>
                    }
                    <Button variant="contained" onClick={refresh} color="secondary">L??m m???i</Button>
                </Box>

                <TextField label="T??m ki???m b??i ????ng" size="small" type="search"
                           InputProps={{startAdornment: <Search/>}} onChange={handleSearchPost}/>
            </Paper>

            <TableContainer sx={{overflow: 1}} onScroll={handleScrollPost}>
                {posts?.data?.map((post, postIndex) =>
                    <Card
                        sx={{mb: 1}}
                        key={postIndex}
                    >
                        <CardHeader sx={{".MuiCardHeader-title": {fontWeight: "bold"}}}
                                    avatar={<Avatar>{post.user.name.last.charAt(0)}</Avatar>}
                                    action={
                                        role.name !== "teacher" ?
                                            <IconButton onClick={(e) => {
                                                setAnchorEl(e.currentTarget);
                                                setActionType("post");
                                                setCurrentPostIndex(postIndex);
                                            }}>
                                                <MoreVert/>
                                            </IconButton>
                                            : <></>
                                    }
                                    title={<>{post.user.name.first} {post.user.name.last} ({roles[post.user.role].label})</>}
                                    subheader={timeSince(new Date(post.createdAt))}
                        />
                        <CardContent>
                            <Typography sx={{mb: 2, fontWeight: "bold"}} variant="h5" align="center">
                                {post.title}
                            </Typography>
                            {post.content.split(/\n/).map((paraph) =>
                                <Typography sx={{mb: 1, textAlign: "justify"}}>
                                    {paraph}
                                </Typography>
                            )}

                            <Divider/>
                            <Typography variant="body2" sx={{mt: 1}}>
                                0 l?????t xem, {post.commentCount} b??nh lu???n
                            </Typography>

                            <TextField sx={{mt: 2}} size="small" fullWidth label="B??nh lu???n..."
                                       InputProps={{endAdornment: <Send/>}}
                                       onKeyPress={(e) => e.key === 'Enter' && handleComment(e, postIndex)}/>

                            {post.comments.slice(0, post.showComment).map((comment, commentIndex) =>
                                <Box key={commentIndex} sx={{display: "flex", my: 1}}>
                                    <Avatar sx={{mr: 1}}>{comment.user.name.last.charAt(0)}</Avatar>
                                    <Box sx={{flex: 1}}>
                                        <Typography variant="body2"
                                                    sx={{fontWeight: "bold"}}>{<>{comment.user.name.first} {comment.user.name.last} ({roles[comment.user.role].label})</>}</Typography>
                                        <Typography
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between"
                                            }}>
                                            {comment.content}

                                            {role.name !== "teacher" || auth._id === comment.user._id ?
                                                <IconButton onClick={(e) => {
                                                    setAnchorEl(e.currentTarget);
                                                    setActionType("comment");
                                                    setCurrentPostIndex(postIndex);
                                                    setCurrentCommentIndex(commentIndex);
                                                }}>
                                                    <MoreVert fontSize="small"/>
                                                </IconButton>
                                                : <></>
                                            }
                                        </Typography>
                                        <Button onClick={() => handleOpenReply(postIndex, commentIndex)}>
                                            Tr??? l???i
                                        </Button>
                                        <Typography sx={{display: "inline"}}
                                                    variant="body2">{timeSince(new Date(comment.createdAt))}</Typography>

                                        {comment.replies.slice(0, comment.showReply).map((reply, replyIndex) =>
                                            <Box key={replyIndex} sx={{display: "flex", my: 1}}>
                                                <Avatar sx={{
                                                    mr: 1,
                                                    width: 30,
                                                    height: 30,
                                                    fontSize: 15
                                                }}>{reply.user.name.last.charAt(0)}</Avatar>
                                                <Box sx={{flex: 1}}>
                                                    <Typography variant="body2"
                                                                sx={{fontWeight: "bold"}}>{<>{reply.user.name.first} {reply.user.name.last} ({roles[reply.user.role].label})</>}</Typography>
                                                    <Typography sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between"
                                                    }}>
                                                        {reply.content}

                                                        {role.name !== "teacher" || auth._id === reply.user._id ?
                                                            <IconButton onClick={(e) => {
                                                                setAnchorEl(e.currentTarget);
                                                                setActionType("reply");
                                                                setCurrentPostIndex(postIndex);
                                                                setCurrentCommentIndex(commentIndex);
                                                                setCurrentReplyIndex(replyIndex);
                                                            }}>
                                                                <MoreVert fontSize="small"/>
                                                            </IconButton>
                                                            : <></>
                                                        }
                                                    </Typography>
                                                    <Button onClick={() => handleOpenReply(postIndex, commentIndex)}>
                                                        Tr??? l???i
                                                    </Button>
                                                    <Typography sx={{display: "inline"}}
                                                                variant="body2">{timeSince(new Date(reply.createdAt))}</Typography>
                                                </Box>
                                            </Box>
                                        )}
                                        <div>
                                            <Button
                                                sx={{display: comment.showReply < comment.replies.length ? "inherit" : "none"}}
                                                onClick={() => handleShowMoreReply(postIndex, commentIndex)}>Xem th??m
                                                tr???
                                                l???i</Button>
                                        </div>

                                        <TextField sx={{display: comment.openReply ? "inherit" : "none"}}
                                                   size="small"
                                                   fullWidth label="Tr??? l???i..." InputProps={{endAdornment: <Send/>}}
                                                   onKeyPress={(e) => e.key === 'Enter' && handleReply(e, postIndex, commentIndex)}/>
                                    </Box>
                                </Box>
                            )}
                            <Button sx={{display: post.showComment < post.comments.length ? "inherit" : "none"}}
                                    onClick={() => handleShowMoreComment(postIndex)}>Xem th??m b??nh lu???n</Button>
                        </CardContent>
                    </Card>
                )}

                {isLoading ?
                    <Card sx={{mb: 3}}>
                        <CardHeader
                            avatar={<Skeleton variant="circular" width={40} height={40}/>}
                            title={<Skeleton variant="text" width={150}/>}
                            subheader={<Skeleton variant="text" width={100}/>}
                        />
                        <CardContent>
                            <Skeleton variant="text"/>
                            <Skeleton variant="text"/>
                        </CardContent>
                    </Card>
                    : <></>
                }

                {!isLoading && posts.endPage ?
                    <Box sx={{display: "flex", justifyContent: "center"}}>
                        <Chip sx={{my: 2}} label="???? xem h???t b??i ????ng" />
                    </Box>
                    : <></>
                }

                {!isLoading && posts?.data?.length === 0 ?
                    <Box sx={{display: "flex", justifyContent: "center"}}>
                        <Chip sx={{my: 2}} label="Kh??ng t??m th???y b??i ????ng" />
                    </Box>
                    : <></>
                }
            </TableContainer>


            <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => {
                    handleOpenDialog(`${actionType}-edit`);
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

            <Dialog maxWidth="lg" open={dialogType === "post-create"} onClose={() => {
                handleCloseDialog();
                setErrors({});
            }}>
                <form onSubmit={handleCreatePost}>
                    <DialogTitle sx={{textAlign: "center"}}>Th??m b??i ????ng m???i</DialogTitle>
                    <DialogContent sx={{"& > :not(style)": {my: 1}}}>
                        <TextField
                            size="small"
                            fullWidth
                            name="title"
                            label="Ti??u ?????"
                            error={Boolean(errors.title)}
                            helperText={
                                errors.title ? errors.title.message : "Ti??u ????? c???a b??i vi???t"
                            }
                        />
                        <TextField
                            size="small"
                            fullWidth
                            multiline
                            rows={10}
                            name="content"
                            label="N???i dung"
                            error={Boolean(errors.content)}
                            helperText={
                                errors.content ? errors.content.message : "N???i dung c???a b??i vi???t"
                            }
                        />
                        <FormControlLabel control={<Checkbox defaultChecked name="sendMail"/>} label="G???i th??ng b??o qua email cho CB - GV"/>
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "center"}}>
                        <Button variant="outlined" onClick={handleCloseDialog}>H???y</Button>
                        <LoadingButton loading={isLoading} type="submit" variant="contained">Th??m</LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog maxWidth="lg" open={dialogType === "post-edit"} onClose={() => {
                handleCloseDialog();
                setCurrentPostIndex(null);
                setErrors({});
            }}>
                <form onSubmit={(e) => handleEditPost(e, currentPostIndex)}>
                    <DialogTitle sx={{textAlign: "center"}}>Ch???nh s???a b??i ????ng</DialogTitle>
                    <DialogContent sx={{"& > :not(style)": {my: 1}}}>
                        {currentPostIndex !== null ?
                            <>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="title"
                                    label="Ti??u ?????"
                                    defaultValue={posts.data[currentPostIndex]?.title}
                                    error={Boolean(errors.title)}
                                    helperText={
                                        errors.title ? errors.title.message : "Ti??u ????? c???a b??i vi???t"
                                    }
                                />
                                <TextField
                                    size="small"
                                    fullWidth
                                    multiline
                                    rows={10}
                                    name="content"
                                    label="N???i dung"
                                    defaultValue={posts.data[currentPostIndex]?.content}
                                    error={Boolean(errors.content)}
                                    helperText={
                                        errors.content ? errors.content.message : "N???i dung c???a b??i vi???t"
                                    }
                                />
                            </>
                            : <></>}
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "center"}}>
                        <Button variant="outlined" onClick={handleCloseDialog}>H???y</Button>
                        <LoadingButton loading={isLoading} type="submit" variant="contained" >C???p nh???t</LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={dialogType === "post-delete"} onClose={() => {
                handleCloseDialog();
                setCurrentPostIndex(null);
            }}>
                <DialogTitle sx={{textAlign: "center"}}>X??a b??i ????ng</DialogTitle>
                <DialogActions sx={{justifyContent: "center"}}>
                    <Button onClick={handleCloseDialog}>H???y</Button>
                    <LoadingButton loading={isLoading} type="submit" color="error" variant="contained"
                                   onClick={() => handleDeletePost(currentPostIndex)}>X??a</LoadingButton>
                </DialogActions>
            </Dialog>

            <Dialog open={dialogType === "comment-edit"} onClose={() => {
                handleCloseDialog();
                setCurrentPostIndex(null);
                setCurrentCommentIndex(null);
            }}>
                <form onSubmit={(e) => handleEditComment(e, currentPostIndex, currentCommentIndex)}>
                    <DialogTitle sx={{textAlign: "center"}}>Ch???nh s???a b??nh lu???n</DialogTitle>
                    <DialogContent sx={{"& > :not(style)": {my: 1}}}>
                        {currentPostIndex !== null && currentCommentIndex !== null ?
                            <>
                                <TextField size="small" fullWidth name="content" label="N???i dung b??nh lu???n"
                                           defaultValue={posts.data[currentPostIndex]?.comments[currentCommentIndex]?.content}/>
                            </>
                            : <></>}
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "center"}}>
                        <Button onClick={handleCloseDialog}>H???y</Button>
                        <LoadingButton loading={isLoading} type="submit" variant="contained" >Ch???nh s???a</LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={dialogType === "comment-delete"} onClose={() => {
                handleCloseDialog();
                setCurrentPostIndex(null);
                setCurrentCommentIndex(null);
            }}>
                <DialogTitle sx={{textAlign: "center"}}>X??c nh???n x??a</DialogTitle>
                <DialogActions sx={{justifyContent: "center"}}>
                    <Button variant="outlined" onClick={handleCloseDialog}>H???y</Button>
                    <LoadingButton loading={isLoading} type="submit" color="error" variant="contained"
                                   onClick={() => handleDeleteComment(currentPostIndex, currentCommentIndex)}>X??a</LoadingButton>
                </DialogActions>
            </Dialog>

            <Dialog open={dialogType === "reply-edit"} onClose={() => {
                handleCloseDialog();
                setCurrentPostIndex(null);
                setCurrentCommentIndex(null);
                setCurrentReplyIndex(null);
            }}>
                <form onSubmit={(e) => handleEditReply(e, currentPostIndex, currentCommentIndex, currentReplyIndex)}>
                    <DialogTitle sx={{textAlign: "center"}}>Ch???nh s???a tr??? l???i</DialogTitle>
                    <DialogContent sx={{"& > :not(style)": {my: 1}}}>
                        {currentPostIndex !== null && currentCommentIndex !== null && currentReplyIndex !== null ?
                            <>
                                <TextField fullWidth size="small" name="content" label="N???i dung tr??? l???i"
                                           defaultValue={posts.data[currentPostIndex]?.comments[currentCommentIndex]?.replies[currentReplyIndex]?.content}/>
                            </>
                            : <></>}
                    </DialogContent>
                    <DialogActions sx={{justifyContent: "center"}}>
                        <Button variant="outlined" onClick={handleCloseDialog}>H???y</Button>
                        <LoadingButton loading={isLoading} variant="contained" type="submit">Ch???nh s???a</LoadingButton>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={dialogType === "reply-delete"} onClose={() => {
                handleCloseDialog();
                setCurrentPostIndex(null);
                setCurrentCommentIndex(null);
                setCurrentReplyIndex(null);
            }}>
                <DialogTitle sx={{textAlign: "center"}}>X??c nh???n x??a</DialogTitle>
                <DialogActions sx={{justifyContent: "center"}}>
                    <Button onClick={handleCloseDialog}>H???y</Button>
                    <LoadingButton loading={isLoading} variant="contained" type="submit" color="error"
                                   onClick={() => handleDeleteReply(currentPostIndex, currentCommentIndex, currentReplyIndex)}>X??a</LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Index;