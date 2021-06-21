const express = require("express");
const router = express.Router();
const db = require("../database");
const { isNotLoggedIn, isLoggedIn } = require("../lib/auth");
const { timeago } = require("../lib/helpers");
const { upload } = require("../lib/multer");
const path = require("path");






///*
//..######...########.########.......###....########..########.
//.##....##..##..........##.........##.##...##.....##.##.....##
//.##........##..........##........##...##..##.....##.##.....##
//.##...####.######......##.......##.....##.##.....##.##.....##
//.##....##..##..........##.......#########.##.....##.##.....##
//.##....##..##..........##.......##.....##.##.....##.##.....##
//..######...########....##.......##.....##.########..########.
//*/
router.get("/add", isLoggedIn, (req, res) => {
  res.render("projects/add.html");
});






///*
//.########...#######...######..########.......###....########..########.
//.##.....##.##.....##.##....##....##.........##.##...##.....##.##.....##
//.##.....##.##.....##.##..........##........##...##..##.....##.##.....##
//.########..##.....##..######.....##.......##.....##.##.....##.##.....##
//.##........##.....##.......##....##.......#########.##.....##.##.....##
//.##........##.....##.##....##....##.......##.....##.##.....##.##.....##
//.##.........#######...######.....##.......##.....##.########..########.
//*/
router.post("/add", upload, async (req, res) => {
  const { project_name, project_url, project_description } = req.body;
  const project_image_route = path.join(
    `/src/public/storage/img/${req.file.filename}`
  );
  const newProject = {
    project_name,
    project_url,
    project_description,
    project_user_id: req.user.id,
    project_image_route,
  };
  await db.query("INSERT INTO projects set ?", [newProject]);
  console.log("DATOS INSERTADOS (ADD-PROJECTS)");
  req.flash("success", "Proyecto Creado Correctamente");

  res.redirect("/proyectos");
});






///*
//..######...########.########....########..########...#######..##....##.########..######..########..#######...######.
//.##....##..##..........##.......##.....##.##.....##.##.....##..##..##..##.......##....##....##....##.....##.##....##
//.##........##..........##.......##.....##.##.....##.##.....##...####...##.......##..........##....##.....##.##......
//.##...####.######......##.......########..########..##.....##....##....######...##..........##....##.....##..######.
//.##....##..##..........##.......##........##...##...##.....##....##....##.......##..........##....##.....##.......##
//.##....##..##..........##.......##........##....##..##.....##....##....##.......##....##....##....##.....##.##....##
//..######...########....##.......##........##.....##..#######.....##....########..######.....##.....#######...######.
//*/
router.get("/", async (req, res) => {
  const projects = await db.query("SELECT * FROM projects");

  if (req.isAuthenticated()) {
    const user = await db.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    const userid = user[0].id;

    console.log("DATOS SELECCIONADOS (PROJECTS) ");
    res.render("projects/list.html", { projects, userid, timeago });
  } else {
    const userid = null;
    res.render("projects/list.html", { projects, userid });
  }
});






///*
//..######...########.########....########..########.##.......########.########.########
//.##....##..##..........##.......##.....##.##.......##.......##..........##....##......
//.##........##..........##.......##.....##.##.......##.......##..........##....##......
//.##...####.######......##.......##.....##.######...##.......######......##....######..
//.##....##..##..........##.......##.....##.##.......##.......##..........##....##......
//.##....##..##..........##.......##.....##.##.......##.......##..........##....##......
//..######...########....##.......########..########.########.########....##....########
//*/
router.get("/delete/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  const proyecto = await db.query(
    "SELECT * FROM projects WHERE project_id = ? ",
    [id]
  );

  if (proyecto.length > 0) {
    if (proyecto[0].project_user_id == req.user.id) {
      await db.query("DELETE FROM projects WHERE project_id = ? ", [id]);
      console.log("DATOS ELIMINADO (REMOVE-PROJECTS)");
      req.flash("success", "Proyecto Eliminado Correctamente");
      return res.redirect("/proyectos");
    } else {
      req.flash("err", "Este proyecto no existe o no es tu proyecto.");
      return res.redirect("/proyectos");
    }
  } else {
    req.flash("err", "Este proyecto no existe o no es tu proyecto.");
    res.redirect("/proyectos");
  }
});






///*
//..######...########.########....########.########..####.########
//.##....##..##..........##.......##.......##.....##..##.....##...
//.##........##..........##.......##.......##.....##..##.....##...
//.##...####.######......##.......######...##.....##..##.....##...
//.##....##..##..........##.......##.......##.....##..##.....##...
//.##....##..##..........##.......##.......##.....##..##.....##...
//..######...########....##.......########.########..####....##...
//*/
router.get("/edit/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const proyecto = await db.query(
    "SELECT * FROM projects WHERE project_id = ? ",
    [id]
  );
  if (proyecto.length > 0) {
    if (proyecto[0].project_user_id != req.user.id) {
      res.redirect("/proyectos");
    } else {
      console.log("DATOS SELECCIONADO (EDIT-PROJECTS) ");

      res.render("projects/edit.html", { proyecto: proyecto[0] });
    }
  } else {
    res.redirect("/proyectos");
  }
});






///*
//.########...#######...######..########....########.########..####.########
//.##.....##.##.....##.##....##....##.......##.......##.....##..##.....##...
//.##.....##.##.....##.##..........##.......##.......##.....##..##.....##...
//.########..##.....##..######.....##.......######...##.....##..##.....##...
//.##........##.....##.......##....##.......##.......##.....##..##.....##...
//.##........##.....##.##....##....##.......##.......##.....##..##.....##...
//.##.........#######...######.....##.......########.########..####....##...
//*/
router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;

  const { project_name, project_url, project_description } = req.body;
  const newProject = {
    project_name,
    project_url,
    project_description,
  };
  await db.query("UPDATE projects set ? WHERE project_id = ?", [
    newProject,
    id,
  ]);
  console.log("DATOS ACTUALIZADOS (EDIT-PROJECTS)");
  req.flash("success", "Proyecto Editado Correctamente");

  res.redirect("/proyectos");
});






///*
//..######...########.########....########..########.########...#######..########..########
//.##....##..##..........##.......##.....##.##.......##.....##.##.....##.##.....##....##...
//.##........##..........##.......##.....##.##.......##.....##.##.....##.##.....##....##...
//.##...####.######......##.......########..######...########..##.....##.########.....##...
//.##....##..##..........##.......##...##...##.......##........##.....##.##...##......##...
//.##....##..##..........##.......##....##..##.......##........##.....##.##....##.....##...
//..######...########....##.......##.....##.########.##.........#######..##.....##....##...
//*/
router.get("/report/:id", isLoggedIn, async (req, res) => {

  const { id } = req.params;
  const user = req.user.id;
  const { report_reason } = req.body;

  const proyecto = await db.query(
    "SELECT * FROM projects WHERE project_id = ? ",
    [id]
  );
  if (proyecto.length < 1) {
    req.flash("err", "Este proyecto no existe.")
    return res.redirect("/proyectos");
    
  }else{

  

    if(proyecto[0].project_reports >= 3){
      req.flash("err", "Este proyecto llegó a los maximos reportes, un Staff lo revisará pronto.");
      return res.redirect("/proyectos");
    } 

  else if(proyecto[0].project_user_id === user){
      req.flash("err", "No puedes reportar tu propio proyecto.");
      return res.redirect("/proyectos")
  }
}      
      return res.render("projects/report.html", { proyecto: proyecto[0] });
});






///*
//.########...#######...######..########....########..########.########...#######..########..########
//.##.....##.##.....##.##....##....##.......##.....##.##.......##.....##.##.....##.##.....##....##...
//.##.....##.##.....##.##..........##.......##.....##.##.......##.....##.##.....##.##.....##....##...
//.########..##.....##..######.....##.......########..######...########..##.....##.########.....##...
//.##........##.....##.......##....##.......##...##...##.......##........##.....##.##...##......##...
//.##........##.....##.##....##....##.......##....##..##.......##........##.....##.##....##.....##...
//.##.........#######...######.....##.......##.....##.########.##.........#######..##.....##....##...
//*/
router.post("/report/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.user.id;
  const { report_reason } = req.body;
  const R = {
    report_project_id: id,
    report_user_id: user,
    report_reason
  }

  if(report_reason.length < 20){
    req.flash("err", "Este reporte es demasiado corto.")
    return res.redirect("/proyectos/report/"+id)
}
  const proyecto = await db.query(
    "SELECT * FROM projects WHERE project_id = ? ",
    [id]
  );
  const project_reports = proyecto[0].project_reports + 1;
  const newProject = {
    project_reports
  };
  await db.query("UPDATE projects set ? WHERE project_id = ?", [
    newProject,
    id,
  ]);


  await db.query("INSERT INTO reportes set ?", [R]);

  console.log("DATOS INSERTADO (REPORT)");
  req.flash("success", "Proyecto Reportado.");

  return res.redirect("/proyectos");
});

module.exports = router;